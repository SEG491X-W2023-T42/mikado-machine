import { Handle, NodeToolbar } from "reactflow";
import NodeToolbarCommon, { useNodeToolbarCommonOperations } from "./NodeToolbarCommon";
import NodeLabel from "./NodeLabel";

export default function LockedNode({ id, data }) {
  const operations = useNodeToolbarCommonOperations();

  return <>
    <NodeToolbar>
      <NodeToolbarCommon id={id} allowSubgraph={true} />
      <button aria-label="Mark incomplete" data-icon="incomplete" onClick={() => operations.setNodeCompleted(id, false)} />
    </NodeToolbar>
    <NodeLabel id={id} label={data.label} />
    <Handle />
    <div aria-label="Completed" />
  </>;
}
