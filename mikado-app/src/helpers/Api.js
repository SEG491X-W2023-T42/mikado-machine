import { doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import * as Counter from "./Autoincrement";
import { createEdgeObject, createNodeObject } from "../graphlayer/store/DisplayObjectFactory";
import { db } from "../graphlayer/store/Gatekeeper";
import { v4 as uuidv4 } from 'uuid';

// Dont need to prune subgraphs every save. This is for keeping track of how many saves has occurred
let saveCount = 0;

/**
 * Loads the nodes and edges from the database.
 */
export async function loadFromDb(uid, graphName, subgraphName) {
  // Grab the user's graph
  let docSnap;
  if (subgraphName !== "") {
    docSnap = await getDoc(doc(db, uid, graphName, "subgraph", subgraphName))
  } else {
    docSnap = await getDoc(doc(db, uid, graphName));
  }

  if (!docSnap.exists()) {
    return [[createNodeObject("0", 0, 0, "goal", "My First Goal", false)], [], {0: []}, {0: []}, []]
  }

  // TODO add a version key and prevent loading newer schemas
  const { node_names, positions, connections, type } = docSnap.data();

  /**
   * Lookup table so that newEdges can follow the remapped ids in newNodes.
   *
   * This cuts the IDs used in the database free from the IDs passed to React Flow.
   * Objects in JavaScript are HashMaps (Arrays are only an optimization) so
   * O(1) average but O(n) worst case access.
   * The good thing compared to an array of sequential indices is that
   * one can avoid O(n) renumberings when trying to delete the middle element.
   * With autoincrement, adding a node is also guaranteed not to collide.
   */
  const databaseKeysToNewIdsLookup = {};
  const forwardConnections = {};
  const backwardConnections = {};
  // Load nodes from db
  const newNodes = Object.entries(node_names).map(([key, label]) => {
    const { x, y, subgraph } = positions[key];
    // Construct object for React Flow
    // Coerce everything to the expected types to ignore potential database schema changes
    const id = Counter.generateAutoincremented().toString();
    databaseKeysToNewIdsLookup[key] = id;
    forwardConnections[id] = [];
    backwardConnections[id] = []
    const completed = false; // TODO unify
    return createNodeObject(id, +x, +y, type?.[key] ?? "ready", label.toString(), completed, (subgraph ?? "").toString());
  });

  // Load edges from db
  const newEdges = Object.entries(connections).flatMap(([key, values]) => {
    const source = databaseKeysToNewIdsLookup[key];
    // Map through outgoing connections
    // Remember that these are directed edges, so {1:[2]} != {2:[1]}
    return values.map(value => {
      const target = databaseKeysToNewIdsLookup[value];
      forwardConnections[source].push(target);
      backwardConnections[target].push(source);
      // Construct JSON for edges, each has a unique ID
      return createEdgeObject(source, target, node_names[key], node_names[value]);
    });
  });
  // TODO verify acyclic (#41)

  return [newNodes, newEdges, forwardConnections, backwardConnections];
}

export async function getAllGraphs(uid) {
	const snapshot = await getDocs(collection(db, uid));
	const changedNames = await getDocs(collection(db, "user", uid, "graphs"))

	let names = {};

	snapshot.forEach((doc) => {
		const map = changedNames.docs.filter((nameDoc) => nameDoc.id == doc.id);
		if (map.length != 0) {
			names[doc.id] = map[0].data().name;
		} else {
			names[doc.id] = doc.id
		}
	})
	return names;

}

export async function addGraph(uid, graphName) {

	const graphId = uuidv4();

  try {
    // check if graph already exist
    const graphDocRef = doc(db, uid, graphId);
    const graphDocSnap = await getDoc(graphDocRef);
  
    if (graphDocSnap.exists()) {
      throw new Error("Graph with the same name already exists.");
    }
  
    const data = {
  
      node_names: {0: 'My First Goal'},
      positions: {0: {x: 0, y: 0, subgraph: ''}},
      connections: {0: []},
      type: {0: 'goal'},
  
    };
  
    await setDoc(graphDocRef, data);

	// Add graph name

	const snap = await getDoc(doc(db, "user", uid, "graphs", graphId))
	let nameData = {name: graphName, version: 0};

	if (snap.exists()) {
		nameData.version = snap.data().version++;
	}

	await setDoc(doc(db, "user", uid, "graphs", graphId), nameData)
    return true;
  } catch (error) {
    console.error("Error adding graph: ", error);
    return false;
  }
}

export async function deleteGraph(uid, graphName) {
  
  try {
    // check if graph already exist
    const graphDocRef = doc(db, uid, graphName);
    const graphDocSnap = await getDoc(graphDocRef);

    if (!graphDocSnap.exists()) {
      throw new Error("Graph does not exist, can't delete.");
    }

    await deleteDoc(graphDocRef);
    return true;

  } catch (error) {
    console.error("Error deleting grpah: ", error);
    return false;
  }
}

/**
 * Saves the nodes and edges to the database.
 */
export function saveToDb(nodes, forwardConnections, uid, graphName, subgraphNodeID) {
  // Construct objects for database

  /**
   * Lookup table to pack nodes back into sequential numbering.
   *
   * Again, this completely renumbers everything. This is necessary to remove gaps and
   * prevent numbers in the database from hitting space limits by getting too large.
   *
   * String idempotency is currently present but may not be guaranteed in the future.
   * That is, a load-save-load guarantees the graphs are isomorphic but there is no
   * guarantee that the IDs won't be swapped. There is currently no code that purposefully
   * swaps them and ES2015/ES2020 makes object iteration deterministic, but don't rely on this.
   *
   * At the very least this may affect z-ordering. This avoided by prohibiting overlapping nodes.
   * Dragging is not a problem as it brings nodes to the top. However, this logic may be changed
   * in the future, in addition to sizes depending on installed browser fonts and this being
   * unenforceable server-side.
   *
   * Another challenge may be collaborative/offline editing. That feature probably won't be
   * implemented for a while, so last-write-wins on the scale of the entire graph should be
   * used for now to simplify things. The problem is that it may be harder to diff changed
   * graphs if the IDs are scrambled or to keep track of what node the current or remote
   * user has selected such as for editing. But there was always the duplicate new node ID
   * problem that existed when the IDs were previously sequential, and that won't even be
   * probabilistically solved until moving to UUIDs per node.
   */

  const newIdsToDatabaseKeysLookup = {};
  // Serialize the nodes
  // For some reason, the database is in Struct-Of-Arrays layout even though it's NoSQL
  const node_names = {};
  const positions = {};
  const type = {};
  nodes.forEach((node, index) => {
    newIdsToDatabaseKeysLookup[node.id] = index;
    // No need to coerce as we own node.data: T for Node<T>
    node_names[index] = node.data.label;
    type[index] = node.type;
    void node.data.completed; // TODO
    // Assuming there is no reason React Flow will change away from { x: number, y: number }
    const pos = positions[index] = node.position;
    pos.subgraph = node.subgraph;
  });

  const connections = {};
  // Loop thru every connection and add to a map
  for (const [key, values] of Object.entries(forwardConnections)) {
    connections[newIdsToDatabaseKeysLookup[key]] = values.map(x => newIdsToDatabaseKeysLookup[x]);
  }

  const data = { connections, node_names, positions, type };
  // Update users collection
  if (subgraphNodeID !== "") {
    return setDoc(doc(db, uid, graphName, "subgraph", subgraphNodeID), data).then(() => {
		if (saveCount > 10) {
			saveCount = 0;
			removeOrphans(uid, graphName);
		} else {
			saveCount++;
		}

		return true;
	}).catch((e) => {
      console.log(e.message);
      return false;
    });
  }
  return setDoc(doc(db, uid, graphName), data).then(() => {
		if (saveCount > 10) {
			saveCount = 0;
			removeOrphans(uid, graphName);
		} else {
			saveCount++;
		}

		return true;
	}).catch((e) => {
		console.log(e.message);
		return false;
  });
}

export async function removeOrphans(uid, graphName) {
	let unvisitedSubgraphs = [];
	let visitedSubgraphs = [];
	let subgraphs = {};

	const docSnap = await getDoc(doc(db, uid, graphName));
	const subgraphDocSnap = await getDocs(collection(db, uid, graphName, "subgraph"))

	// Reduce docsnap to just graph ids
	subgraphDocSnap.forEach((doc) => {
		subgraphs[doc.id] = Object.values(doc.data().positions).filter((node) => node.subgraph != "").map((node) => node.subgraph);
	});

	unvisitedSubgraphs = unvisitedSubgraphs.concat(Object.values(docSnap.data().positions).filter((node) => node.subgraph != "").map((node) => node.subgraph))

	// Mark all subgraphs that are connected
	while (unvisitedSubgraphs.length > 0) {
		const subgraphToVisit = unvisitedSubgraphs.pop();
		
		if (subgraphs[subgraphToVisit] !== undefined) {
			unvisitedSubgraphs = unvisitedSubgraphs.concat(subgraphs[subgraphToVisit])
		}
		visitedSubgraphs.push(subgraphToVisit);		
	}

	// Delete all subgraphs that are not connected
	for (const subgraph of Object.keys(subgraphs)) {
		if (!visitedSubgraphs.includes(subgraph)) {
			deleteDoc(doc(db, uid, graphName, "subgraph", subgraph));
		}
	}

}
