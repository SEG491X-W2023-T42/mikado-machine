import './App.css';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";

import 'reactflow/dist/style.css';

const firebaseConfig = {
  apiKey: "AIzaSyAqv6_n045I2vtjTIAfDUB9m2l_pru4a6k",
  authDomain: "mikado-method.firebaseapp.com",
  projectId: "mikado-method",
  storageBucket: "mikado-method.appspot.com",
  messagingSenderId: "802728306359",
  appId: "1:802728306359:web:103ed63ed1ba448ef80f32"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/*{ id: '1', position: { x: 0, y: 0}, data: { label: '1'} },
{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }*/

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const initialNodes = [{ id: '1', position: { x: 0, y: 0}, data: { label: '1'} }];

function App() {

  useEffect(() => {
    const getData = async () => {
      
      const docRef = doc(db, "user-1", "graph-1");
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {

        const nodeLoad = docSnap.data().node_names;
        initialNodes.length = 0;
        for (let key in nodeLoad) {
          const node = {};
          node.id = key.toString();
          node.position = {x: 0, y: 0};
          node.data = { label: nodeLoad[key] };
          initialNodes.push(node);
          setNodes(initialNodes);
        }

      } else {
        console.log("not exist");
      }
  
    }
    getData();
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{height: "100vh"}}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default App;
