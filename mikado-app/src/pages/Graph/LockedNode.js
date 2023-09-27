import { Handle, NodeToolbar } from "reactflow";
import BlockedIcon from '@mui/icons-material/RemoveCircle';
import NodeToolbarCommon from "./NodeToolbarCommon";
import NodeLabel from "./NodeLabel";

export default function LockedNode({ id, data }) {
  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id} />
      </NodeToolbar>
      <NodeLabel id={id} label={data.label} />
      <Handle />
      <BlockedIcon />
    </div>
  )
}
