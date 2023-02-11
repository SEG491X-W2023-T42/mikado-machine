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

// Public credentials
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

// Intitial values for the nodes & edges -- DO NOT MAKE THEM EMPTY --
const initialNodes = [{ id: '1', position: { x: 0, y: 0}, data: { label: '1'} }];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function Graph() {
  // Flow setup
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const getData = async () => {
      
      // Grab the temp user data
      const docRef = doc(db, "user-1", "graph-1");
      const docSnap = await getDoc(docRef);
  
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
          node.data = { label: nodeLoad[key] };
          newNodes.push(node);
        }
        setNodes(newNodes);


        // Load edges from db
        const edgeLoad = docSnap.data().connections;
        const newEdges = [];
        initialEdges.length = 0;

        // Construct JSON for edges, each has a unique ID 
        for (let key in edgeLoad) {
          edgeLoad[key].forEach((item, index) => {
            const edge = {};
            edge.id = "e" + key.toString() + "-" + item.toString();
            edge.source = key.toString();
            edge.target = item.toString();
            newEdges.push(edge);
          });
        }
        setEdges(newEdges)

      } else {
        console.log("not exist");
      }
  
    }
    getData();
  }, [setEdges, setNodes]);

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

export default Graph;
