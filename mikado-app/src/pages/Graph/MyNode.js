import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const deleteNodeSelector = (state) => state.operations.deleteNode;

function MyNode({ id, data }) {
  const deleteNode = useDisplayLayerStore(deleteNodeSelector);

  return <>
    <NodeToolbar>
      <button onClick={() => deleteNode(id)}>&#128465;</button>
    </NodeToolbar>
    {data.label}
    <Handle />
  </>
}

export default MyNode;
