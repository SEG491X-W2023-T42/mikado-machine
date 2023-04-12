import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import DeleteIcon from '@mui/icons-material/Delete';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function MyNode({ id, data }) {
  const operations = useDisplayLayerStore(operationsSelector);

  // TODO add node completion checkmark button
  void operations.setNodeCompleted;
  return (

    <div className={data.completed ? "node-done" : "node-future"}>
      <NodeToolbar>
        <button onClick={() => operations.deleteNode(id)}>
          <DeleteIcon />
        </button>
      </NodeToolbar>
        {data.label}
      <Handle />
    </div>

    
  )
}

export default MyNode;
