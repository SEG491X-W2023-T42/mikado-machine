import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function ReadyNode({ id, data }) {
  const operations = useDisplayLayerStore(operationsSelector);

  // TODO add node completion checkmark button
  void operations.setNodeCompleted;
  return (

    <div>
      <NodeToolbar>
        <button onClick={() => operations.deleteNode(id)}>
          <DeleteIcon />
        </button>
      </NodeToolbar>
        {data.label}
      <Handle />
      <AutoAwesomeIcon />
    </div>

    
  )
}

export default ReadyNode;