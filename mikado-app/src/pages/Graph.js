import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { firebase } from '../firebase';
import { useNavigate } from 'react-router-dom';

import { FirebaseContext } from '../context/FirebaseContext';
import CustomControl from '../components/save';

import 'reactflow/dist/style.css';

const db = getFirestore(firebase);

// Intitial values for the nodes & edges -- DO NOT MAKE THEM EMPTY --
const initialNodes = [{ id: '1', position: { x: 0, y: 0}, data: { label: '1'} }];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function Graph() {
  // Flow setup
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { user } = FirebaseContext();
  const navigate = useNavigate();

  // Make sure the user is signed in
  useEffect(() => {
    if (user != null) {
        if (Object.keys(user).length === 0) {
            navigate('/');
        }
    }

    if (user == null) {
      navigate('/');
    }
}, [user]);

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
        <CustomControl />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default Graph;
