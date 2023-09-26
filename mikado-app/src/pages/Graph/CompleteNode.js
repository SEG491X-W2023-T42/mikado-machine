import { Handle, NodeToolbar } from "reactflow";
import CheckIcon from '@mui/icons-material/Check';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import NodeToolbarCommon, { useNodeToolbarCommonOperations } from "./NodeToolbarCommon";

export default function LockedNode({ id, data }) {
  const operations = useNodeToolbarCommonOperations();

  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id} />
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
