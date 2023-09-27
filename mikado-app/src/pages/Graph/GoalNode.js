import { Handle, NodeToolbar } from "reactflow";
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import NodeToolbarCommon from "./NodeToolbarCommon";
import NodeLabel from "./NodeLabel";

function GoalNode({ id, data }) {
  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id} allowSubgraph={false} />
      </NodeToolbar>
      <NodeLabel id={id} label={data.label} />
      <Handle />
      <EmojiFlagsIcon />
    </div>
  )
}

export default GoalNode;
