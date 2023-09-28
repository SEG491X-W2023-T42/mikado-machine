import { ConnectionMode, Handle, NodeToolbar } from "reactflow";
import { useEnterGraphHack } from "./EnterGraphHackContext";
import { runtime_assert } from "../../viewmodel/assert";
import { useStoreHack } from "../../StoreHackContext";
import SeamlessEditor from "../../components/SeamlessEditor";

export const MY_NODE_CONNECTION_MODE = ConnectionMode.Loose;

const selector = (state) => {
  const { editingNodeId, editingNodeInitialValue, editNode, operations } = state;
  return { editingNodeId, editingNodeInitialValue, editNode, operations };
};

const ARIA_LABELS = {
  "complete": "Completed",
  "goal": "Goal",
  "locked": "Blocked",
  "ready": "Ready",
};

export default function MyNode({ id, data, type, exporting = false, ...rest }) {
  const { editingNodeId, editingNodeInitialValue, editNode, operations } = exporting ? {} : useStoreHack()(selector);
  const editing = editingNodeId === id;

  const subgraph = operations?.isNodeSubgraph(id);
  const enterGraph = useEnterGraphHack();

  const goal = type === "goal";
  const locked = type === "locked";
  const completed = type === "complete";
  const ariaLabel = ARIA_LABELS[type];
  runtime_assert(ariaLabel);

  const result = <>
    {exporting ? null : <NodeToolbar>
      <button aria-label="Delete" data-icon="delete" onClick={() => operations.deleteNode(id)} />
      {goal ? null : <button
        aria-label={subgraph ? "Enter subgraph" : "Create subgraph"}
        data-icon={subgraph ? "enter-subgraph" : "create-subgraph"}
        onClick={() => enterGraph((uid) => operations.createSubgraphAndSaveIfNotExists(uid, id))}
      />}
      {goal || locked ? null : <button
        aria-label={completed ? "Mark incomplete" : "Mark completed"}
        data-icon={completed ? "incomplete" : "completed"}
        onClick={() => void operations.setNodeCompleted(id, !completed)}
      />}
    </NodeToolbar>}
    <SeamlessEditor
      label={data.label}
      editing={editing}
      exporting={exporting}
      initialValue={!editing ? "" : editingNodeInitialValue}
      onFinishEditing={(filteredText) => {
        editNode("", "");
        operations.setNodeLabel(id, filteredText);
      }}
      singleLine={false}
    />
    {exporting ? null : <Handle />}
    <div aria-label={ariaLabel} />
  </>;
  if (exporting) {
    const { position, positionOffset } = rest; // Exists when exporting only
    return <div
      style={{
        position: "absolute",
        left: position.x + positionOffset.x + "px",
        top: position.y + positionOffset.y + "px",
      }}
      className={"react-flow__node react-flow__node-" + type}
    >
      {result}
    </div>
  }
  return result;
}
