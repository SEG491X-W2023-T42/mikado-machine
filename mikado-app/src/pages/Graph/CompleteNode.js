import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function LockedNode({ id, data }) {
  const operations = useDisplayLayerStore(operationsSelector);

  return (

    <div>
      <NodeToolbar>
        <button onClick={() => operations.deleteNode(id)}>
          <DeleteIcon />
        </button>
        <button onClick={() => operations.setNodeCompleted(id, false)}>
            <HighlightOffIcon />
        </button>
      </NodeToolbar>
        {data.label}
      <Handle />
      <CheckIcon />
    </div>

    
  )
}

export default LockedNode;
