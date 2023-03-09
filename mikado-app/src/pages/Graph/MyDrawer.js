import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";
import { useEffect, useRef } from "react";

export const DRAG_AND_DROP_MIME = "application/mikado-app";
export const DRAG_AND_DROP_MAGIC = "mikado-mikado";
export const DRAG_AND_DROP_EFFECT = "move";

function onDragStart(event) {
  event.dataTransfer.setData(DRAG_AND_DROP_MIME, DRAG_AND_DROP_MAGIC);
  event.dataTransfer.effectAllowed = DRAG_AND_DROP_EFFECT;
}

function MyDrawer({ displayLayerHandle }) {
  // TODO fix the swiping on desktop
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    current && (current.value = displayLayerHandle.getSelectedNodeName());
  }, [displayLayerHandle]);
  const selectedNodeName = displayLayerHandle.getSelectedNodeName();
  console.log("snn", selectedNodeName);
  return <SwipeableDrawer
    open={true}
    onClose={() => void 0}
    onOpen={() => void 0}
    anchor="bottom"
    variant="persistent"
    disableSwipeToOpen={false}
  >
    <div id="puller"></div>
    {typeof selectedNodeName === "string" ?
      <input ref={ref} onChange={e => displayLayerHandle.setSelectedNodeName(e.target.value)} />
      :
      <div id="add-node-button" onDragStart={onDragStart} draggable>Add Node</div>
    }
  </SwipeableDrawer>;
  // TODO add onclick random insertion when drag and drop is not available, and implement that in a way that doesn't cancel on intersections
}

export default MyDrawer;
