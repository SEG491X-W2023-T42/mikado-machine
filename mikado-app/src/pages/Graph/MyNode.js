import { ConnectionMode, Handle, NodeToolbar } from "reactflow";

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

function MyNode({ data }) {
  return <>
    <NodeToolbar>
      <button>Hello</button>
    </NodeToolbar>
    {data.label}
    <Handle />
  </>
}

export default MyNode;
