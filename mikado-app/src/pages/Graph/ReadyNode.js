import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useStoreHack } from "../../StoreHackContext.js";
import DeleteIcon from '@mui/icons-material/Delete';
import GrassIcon from '@mui/icons-material/Grass';
import CheckIcon from '@mui/icons-material/Check';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function ReadyNode({ id, data }) {
  const operations = useStoreHack()(operationsSelector);

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
      <GrassIcon />
    </div>


  )
}

export default ReadyNode;
