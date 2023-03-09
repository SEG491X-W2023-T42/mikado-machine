import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { firebase, USING_DEBUG_EMULATORS } from '../firebase';
import { runtime_assert } from "./assert";
import generateAutoincremented from "./autoincrement";
import { createEdgeObject, createNodeObject } from "./displayObjectFactory";

const db = getFirestore(firebase);
if (USING_DEBUG_EMULATORS) {
  connectFirestoreEmulator(db, "localhost", 8080);
}

/**
 * The default Mikado to open.
 *
 * For now this default graph is the only graph available until saving/multiple different files/documents is implemented.
 * Also, there is only one layer of the graph available until the subtrees feature is implemented.
 */
const DEFAULT_GRAPH_ID = "graph-1";

/**
 * A fallback "user account" to grab initial data from to introduce the user with.
 */
const FALLBACK_TEMPLATE_USER_ID = "user-1";

/**
 * Loads the nodes and edges from the database.
 */
export async function loadFromDb(uid) {
  // Grab the user's graph
  let docSnap = await getDoc(doc(db, uid, DEFAULT_GRAPH_ID));

  if (!docSnap.exists()) {
    // Grab fallback graph
    docSnap = await getDoc(doc(db, FALLBACK_TEMPLATE_USER_ID, DEFAULT_GRAPH_ID));
  }

  runtime_assert(docSnap.exists());

  // TODO add a version key and prevent loading newer schemas
  const { node_names, positions, connections } = docSnap.data();

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
    const { x, y } = positions[key];
    // Construct object for React Flow
    // Coerce everything to the expected types to ignore potential database schema changes
    const id = generateAutoincremented().toString();
    databaseKeysToNewIdsLookup[key] = id;
    forwardConnections[id] = [];
    backwardConnections[id] = []
    const completed = false; // TODO
    return createNodeObject(id, +x, +y, label.toString(), completed);
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
      return createEdgeObject(source, target);
    });
  });
  // TODO verify acyclic (#41)

  return [newNodes, newEdges, forwardConnections, backwardConnections];
}

/**
 * Saves the nodes and edges to the database.
 */
export function saveToDb(nodes, forwardConnections, uid) {
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
  nodes.forEach((node, index) => {
    newIdsToDatabaseKeysLookup[node.id] = index;
    // No need to coerce as we own node.data: T for Node<T>
    node_names[index] = node.data.label;
    void node.data.completed; // TODO
    // Assuming there is no reason React Flow will change away from { x: number, y: number }
    positions[index] = node.position;
  });

  const connections = {};
  // Loop thru every connection and add to a map
  for (const [key, values] of Object.entries(forwardConnections)) {
    connections[newIdsToDatabaseKeysLookup[key]] = values.map(x => newIdsToDatabaseKeysLookup[x]);
  }

  const data = { connections, node_names, positions };
  // Update users collection
  return setDoc(doc(db, uid, DEFAULT_GRAPH_ID), data).then(() => true).catch((e) => {
    console.log(e.message);
    return false;
  });
}
