import { MarkerType } from "reactflow";
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { firebase, USING_DEBUG_EMULATORS } from '../firebase';
import { runtime_assert } from "./assert";

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

  // Load nodes from db
  const newNodes = Object.entries(node_names).map(([key, label]) => {
    const { x, y } = positions[key];
    // Construct object for React Flow
    // Coerce everything to the expected types to ignore potential database schema changes
    return {
      id: key.toString(),
      position: { x: +x, y: +y },
      data: { label: label.toString() },
    };
  });

  // Load edges from db
  const newEdges = Object.entries(connections).flatMap(([key, values]) => {
    const source = key.toString();
    // Map through outgoing connections
    // Remember that these are directed edges, so {1:[2]} != {2:[1]}
    return values.map(value => {
      const target = value.toString();
      // Construct JSON for edges, each has a unique ID
      return { id: `e${source}-${target}`, source, target };
    });
  });

  return [newNodes, newEdges];
}

/**
 * Saves the nodes and edges to the database.
 */
export async function saveToDb(nodes, edges, uid) {
  // Construct objects for database

  // Serialize the nodes
  // For some reason, the database is in Struct-Of-Arrays layout even though it's NoSQL
  const node_names = {};
  const positions = {};
  nodes.forEach((node) => {
    // By the way, for some reason the database is one-indexed
    const key = node.id;
    // No need to coerce as we own node.data: T for Node<T>
    node_names[key] = node.data.label;
    // Assuming there is no reason React Flow will change away from { x: number, y: number }
    positions[key] = node.position;
  });

  const connections = {};
  // Loop thru every connection and add to a map
  for (const edge of edges) {
    const { source, target } = edge;
    (connections[source] = connections[source] || []).push(target);
  }

  const data = { connections, node_names, positions };
  try {
    // Update users collection
    await setDoc(doc(db, uid, DEFAULT_GRAPH_ID), data);
  } catch (e) {
    console.log(e.message);
    return false;
  }
  return true;
}
