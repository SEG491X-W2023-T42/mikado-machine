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
  const wasComposingRef = useRef(false);
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
    const filteredText = text.replaceAll('\n', ' ');
    operations.setNodeLabel(id, filteredText);
    setText(filteredText);
  }
  return <input
    type="text"
    autoFocus={editing}
    disabled={!editing}
    value={text}
    onChange={(e) => {setText(e.target.value)}}
    onKeyDown={(e) => {
      // Don't break IMEs
      wasComposingRef.current = e.nativeEvent.isComposing;
    }}
    onKeyUp={(e) => {
      if (e.key !== "Enter") return;
      if (wasComposingRef.current) return;
      finishEditing();
    }}
    onBlur={finishEditing}
    ref={ref}
  />

  // TODO: performance
  // - Use HTMLInputElement over TextNode only when necessary
  // - Find a way so that targeting a node for editing does not force all nodes to rerender. Perhaps optimize the store access a bit
}
