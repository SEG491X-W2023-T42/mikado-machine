import { MarkerType } from "reactflow";
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { firebase, USING_DEBUG_EMULATORS } from '../firebase';

const db = getFirestore(firebase);
if (USING_DEBUG_EMULATORS) {
  connectFirestoreEmulator(db, "localhost", 8080);
}

export async function loadFromDb(uid) {
  // Grab the user's graph
  let docSnap = await getDoc(doc(db, uid, "graph-1"));

  if (!docSnap.exists()) {
    // Grab fallback graph
    docSnap = await getDoc(doc(db, "user-1", "graph-1"));
  }

  if (docSnap.exists()) {
    // Load nodes from db
    const nodeLoad = docSnap.data().node_names;
    const positionLoad = docSnap.data().positions;
    const newNodes = [];

    // Construct JSON object
    for (let key in nodeLoad) {
      const node = {};
      node.id = key.toString();
      node.position = { x: positionLoad[key]['x'], y: positionLoad[key]['y'] };
      node.data = { label: nodeLoad[key] };
      newNodes.push(node);
    }

    // Load edges from db
    const edgeLoad = docSnap.data().connections;
    const newEdges = [];

    // Construct JSON for edges, each has a unique ID
    for (let key in edgeLoad) {
      edgeLoad[key].forEach((item, index) => {
        const edge = {};
        edge.id = "e" + key.toString() + "-" + item.toString();
        edge.source = key.toString();
        edge.target = item.toString();

        // Add arrows to edge
        edge.markerStart = {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: "black"
        }
        edge.style = {
          strokeWidth: 3,
          stroke: "black",
        }
        newEdges.push(edge);
      });
    }

    return [newNodes, newEdges];
  } else {
    console.log("not exist");
  }
}

export async function saveToDb(nodes, edges, uid) {
  // Construct objects for database
  let connections = {};
  let node_names = {};
  let positions = {};

  for (let key in nodes) {
    node_names[parseInt(key) + 1] = nodes[key].data.label
    positions[parseInt(key) + 1] = ({ x: nodes[key].position.x, y: nodes[key].position.y });
  }

  for (let key in edges) {
    // Loop thru every connection and add to an array
    if (connections[parseInt(edges[key].source)] === undefined) {
      connections[parseInt(edges[key].source)] = [];
      connections[parseInt(edges[key].source)].push(parseInt(edges[key].target));
    } else {
      connections[parseInt(edges[key].source)].push(parseInt(edges[key].target));
    }

  }

  try {
    // Update users collection
    await setDoc(doc(db, uid, "graph-1"), {
      connections: connections,
      node_names: node_names,
      positions: positions
    });
  } catch (e) {
    console.log(e.message);
    return false;
  }
  return true;
}
