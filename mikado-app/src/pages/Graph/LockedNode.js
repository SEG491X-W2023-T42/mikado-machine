import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useStoreHack } from "../../StoreHackContext.js";
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function LockedNode({ id, data }) {
  const operations = useStoreHack()(operationsSelector);

  return (

    <div>
      <NodeToolbar>
        <button onClick={() => operations.deleteNode(id)}>
          <DeleteIcon />
        </button>
      </NodeToolbar>
        {data.label}
      <Handle />
      <LockIcon />
    </div>


  )
}

export default LockedNode;
