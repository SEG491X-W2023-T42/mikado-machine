import { ConnectionMode, Handle, Position } from "reactflow";

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

function MyNode({ data }) {
  return <>
    {data.label}
    <Handle />
  </>
}

export default MyNode;
