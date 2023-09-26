import { Handle, NodeToolbar } from "reactflow";
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import NodeToolbarCommon from "./NodeToolbarCommon";

function GoalNode({ id, data }) {
  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id}/>
      </NodeToolbar>
        {data.label}
      <Handle />
      <EmojiFlagsIcon />
    </div>
  )
}

export default GoalNode;
