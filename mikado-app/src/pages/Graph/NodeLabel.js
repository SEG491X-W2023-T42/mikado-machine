import { useStoreHack } from "../../StoreHackContext";
import SeamlessEditor from "../../components/SeamlessEditor";

const selector = (state) => {
  const {editingNodeId, editingNodeInitialValue, editNode, operations} = state;
  return {editingNodeId, editingNodeInitialValue, editNode, operations};
};

export default function NodeLabel({ id, label }) {
  const {editingNodeId, editingNodeInitialValue, editNode, operations} = useStoreHack()(selector);
  const editing = editingNodeId === id;
  // <input> is single link
  // <div contenteditable> is an accessibility and security problem
  return <SeamlessEditor
    label={label}
    editing={editing}
    initialValue={!editing ? "" : editingNodeInitialValue}
    onFinishEditing={(filteredText) => {
      editNode("", "");
      operations.setNodeLabel(id, filteredText);
    }}
    singleLine={false}
  />
}
