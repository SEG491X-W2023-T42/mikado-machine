import { useEffect, useRef } from "react";
import FAB from "./FAB.js"

function Overlay({ displayLayerHandle, FABonClick }) {
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    current && (current.value = displayLayerHandle.getSelectedNodeName());
  }, [displayLayerHandle]);

  return (

    <FAB onClick={FABonClick}/>

  );

}

export default Overlay;
