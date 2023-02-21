/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import ReactFlow, { addEdge, Background, MarkerType, useEdgesState, useNodesState, } from 'reactflow';
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { firebase, USING_DEBUG_EMULATORS } from '../../firebase';

import CustomControl from '../../components/CustomControl/CustomControl';

import 'reactflow/dist/style.css';

const db = getFirestore(firebase);
if (USING_DEBUG_EMULATORS) {
  connectFirestoreEmulator(db, "localhost", 8080);
}

/**
 * The DisplayLayer component shows ane layer of a Mikado that can be edited.
 *
 * A new DisplayLayer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */
function DisplayLayer({ uid, setSuccessOpen, setErrorOpen }) {
  // Flow setup
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load data from db
  useEffect(() => {
    const getData = async () => {
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
          node.position = {x: positionLoad[key]['x'], y: positionLoad[key]['y']};
          node.data = {label: nodeLoad[key]};
          newNodes.push(node);
        }
        setNodes(newNodes);

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
        setEdges(newEdges)
      } else {
        console.log("not exist");
      }
    }
    getData();
  }, [setEdges, setNodes, uid]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onSave = async () => {
    // Construct objects for database
    let connections = {};
    let node_names = {};
    let positions = {};

    for (let key in nodes) {
      node_names[parseInt(key) + 1] = nodes[key].data.label

      positions[parseInt(key) + 1] = ({x: nodes[key].position.x, y: nodes[key].position.y});
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
      setSuccessOpen(true);
    } catch (e) {
      setErrorOpen(true);
      console.log(e.message);
    }
  };

  return (
    <main>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <CustomControl onClick={() => {
          onSave()
        }} />

        <Background />
      </ReactFlow>
    </main>
  );
}

export default DisplayLayer;
