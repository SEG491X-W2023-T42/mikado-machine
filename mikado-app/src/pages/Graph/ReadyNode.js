import { Handle, NodeToolbar } from "reactflow";
import GrassIcon from '@mui/icons-material/Grass';
import CheckIcon from '@mui/icons-material/Check';
import NodeToolbarCommon, { useNodeToolbarCommonOperations } from "./NodeToolbarCommon";
import NodeLabel from "./NodeLabel";

export default function ReadyNode({ id, data }) {
  const operations = useNodeToolbarCommonOperations();

  return (
    <div>
      <NodeToolbar>
        <NodeToolbarCommon id={id} allowSubgraph={true} />
        <button onClick={() => operations.setNodeCompleted(id, true)}>
            <CheckIcon />
        </button>
      </NodeToolbar>
      <NodeLabel id={id} label={data.label} />
      <Handle />
      <GrassIcon />
    </div>
  )
}
