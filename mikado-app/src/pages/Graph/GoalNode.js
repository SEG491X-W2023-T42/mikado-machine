import { Handle, NodeToolbar } from "reactflow";
import NodeToolbarCommon from "./NodeToolbarCommon";
import NodeLabel from "./NodeLabel";

export default function GoalNode({ id, data }) {
  return <>
    <NodeToolbar>
      <NodeToolbarCommon id={id} allowSubgraph={false} />
    </NodeToolbar>
    <NodeLabel id={id} label={data.label} />
    <Handle />
    <div aria-label="Goal" />
  </>;
}
