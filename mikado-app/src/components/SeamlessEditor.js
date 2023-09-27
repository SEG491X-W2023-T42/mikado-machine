import { createElement, useEffect, useRef, useState } from "react";

export default function SeamlessEditor({ label, editing, initialValue, onFinishEditing, singleLine }) {
  const [text, setText] = useState(label);
  const ref = useRef(void 0);
  const wasComposingRef = useRef(false);
  useEffect(() => {
    if (editing) {
      setText(initialValue);
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);
  if (!singleLine) {
    useEffect(() => {
      const { current } = ref;
      if (!current) return;
      const { style } = current;
      // Shrink and grow based on content
      style.height = 0;
      style.height = current.scrollHeight + "px";
    }, [text]);
  }
  if (!editing && text !== label) {
    setText(label);
  }

  function finishEditing() {
    onFinishEditing(text.replaceAll('\n', ' '));
  }

  // <input> is single line, so <textarea> is needed
  // <div contenteditable> is an accessibility and security problem
  const props = {
    autoFocus: editing,
    className: "seamless-editor",
    disabled: !editing,
    value: text,
    onChange(e) {
      setText(e.target.value);
    },
    onKeyDown(e) {
      // Don't break IMEs
      wasComposingRef.current = e.nativeEvent.isComposing;
    },
    onKeyUp(e) {
      if (e.key !== "Enter") return;
      if (wasComposingRef.current) return;
      finishEditing();
    },
    onBlur: finishEditing,
    ref,
  }
  if (singleLine) {
    props.type = "text";
  } else {
    props.rows = 1;
  }
  return createElement(singleLine ? "input" : "textarea", props);

  // TODO: performance
  // - Use HTMLInputElement over TextNode only when necessary
  // - Find a way so that targeting a node for editing does not force all nodes to rerender. Perhaps optimize the store access a bit
}
