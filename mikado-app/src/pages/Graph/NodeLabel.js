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
  useEffect(() => {
    const { current } = ref;
    if (!current) return;
    const { style } = current;
    // Shrink and grow based on content
    style.height = 0;
    style.height = current.scrollHeight + "px";
  }, [text]);
  if (!editing && text !== label) {
    setText(label);
  }
  function finishEditing() {
    editNode("", "");
    const filteredText = text.replaceAll('\n', ' ');
    operations.setNodeLabel(id, filteredText);
    setText(filteredText);
  }
  // <input> is single link
  // <div contenteditable> is an accessibility and security problem
  return <textarea
    autoFocus={editing}
    disabled={!editing}
    value={text}
    rows={1}
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
