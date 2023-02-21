import { Handle, Position } from "reactflow";

function MyNode({ data }) {
  return <>
    <input defaultValue={data.label} />
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </>
}

export default MyNode;
