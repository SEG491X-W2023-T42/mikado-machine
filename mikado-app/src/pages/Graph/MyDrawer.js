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

function MyDrawer({ selectionData }) {
  // TODO fix the swiping on desktop
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    if (current) {
      current.value = selectionData.name;
    }
  }, [selectionData]);
  return <SwipeableDrawer
    open={true}
    onClose={() => void 0}
    onOpen={() => void 0}
    anchor="bottom"
    variant="persistent"
    disableSwipeToOpen={false}
  >
    <div id="puller"></div>
    {selectionData ?
      <input ref={ref} onChange={e => selectionData.setName(e.target.value)} />
      :
      <div id="add-node-button" onDragStart={onDragStart} draggable>Add Node</div>
    }
  </SwipeableDrawer>;
  // TODO add onclick random insertion when drag and drop is not available, and implement that in a way that doesn't cancel on intersections
}

export default MyDrawer;
