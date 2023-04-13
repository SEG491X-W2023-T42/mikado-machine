import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useStoreHack } from "../../StoreHackContext.js";
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const operationsSelector = (state) => state.operations;

function GoalNode({ id, data }) {
  const operations = useStoreHack()(operationsSelector);

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
      <EmojiFlagsIcon />
    </div>


  )
}

export default GoalNode;
