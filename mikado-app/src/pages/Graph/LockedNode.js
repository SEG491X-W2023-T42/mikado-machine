import { Handle, NodeToolbar } from "reactflow";
import LockIcon from '@mui/icons-material/Lock';
import NodeToolbarCommon from "./NodeToolbarCommon";

export default function LockedNode({ id, data }) {
  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id} />
      </NodeToolbar>
        {data.label}
      <Handle />
      <LockIcon />
    </div>
  )
}
