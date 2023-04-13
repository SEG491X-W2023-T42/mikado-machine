import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useStoreHack } from "../../StoreHackContext.js";
import DeleteIcon from '@mui/icons-material/Delete';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function MyNode({ id, data }) {
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
    </div>


  )
}

export default MyNode;
