import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function ReadyNode({ id, data }) {
  const operations = useDisplayLayerStore(operationsSelector);

  return (

    <div>
      <NodeToolbar>
        <button onClick={() => operations.deleteNode(id)}>
          <DeleteIcon />
        </button>
        <button onClick={() => operations.setNodeCompleted(id, true)}>
            <CheckIcon />
        </button>
      </NodeToolbar>
        {data.label}
      <Handle />
      <AutoAwesomeIcon />
    </div>

    
  )
}

export default ReadyNode;
