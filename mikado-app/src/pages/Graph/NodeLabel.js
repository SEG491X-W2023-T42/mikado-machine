import { useEffect, useRef, useState } from "react";
import { useStoreHack } from "../../StoreHackContext";

const selector = (state) => {
  const {editingNodeId, editingNodeInitialValue, editNode, operations} = state;
  return {editingNodeId, editingNodeInitialValue, editNode, operations};
};

export default function NodeLabel({ id, label }) {
  const {editingNodeId, editingNodeInitialValue, editNode, operations} = useStoreHack()(selector);
  const [text, setText] = useState(label);
  const ref = useRef(void 0);
  const editing = editingNodeId === id;
  useEffect(() => {
    if (editing) {
      setText(editingNodeInitialValue);
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);
  if (!editing && text !== label) {
    setText(label);
  }
  function finishEditing() {
    editNode("", "");
    operations.setNodeLabel(id, text);
  }
  return <input
    type="text"
    autoFocus={editing}
    disabled={!editing}
    value={text}
    onChange={(e) => {setText(e.target.value)}}
    onKeyUp={(e) => {
      if (e.key !== "Enter") return;
      finishEditing();
    }}
    onBlur={finishEditing}
    ref={ref}
  />

  // TODO: performance
  // - Use HTMLInputElement over TextNode only when necessary
  // - Find a way so that targeting a node for editing does not force all nodes to rerender. Perhaps optimize the store access a bit
}
