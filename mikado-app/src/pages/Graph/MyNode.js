import { ConnectionMode, Handle, NodeToolbar, Position } from "reactflow";
import { useState } from "react";

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

function MyNode({ data }) {
  const [isVisible, setVisible] = useState(false);

  return <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
    <NodeToolbar isVisible={isVisible} position={Position.Top}>
      <button>Hello</button>
    </NodeToolbar>
    {data.label}
    <Handle />
  </div>
}

export default MyNode;
