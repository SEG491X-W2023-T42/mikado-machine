import { useEffect, useState } from "react";

export default function NodeLabel({ id, label }) {
  // TODO bind to store
  void id;
  const [text, setText] = useState("");
  useEffect(() => {
    setText(label);
  }, []);
  return <input
    type="text"
    disabled={true}
    value={text}
    onChange={(e) => setText(e.target.value)}
  />
}
