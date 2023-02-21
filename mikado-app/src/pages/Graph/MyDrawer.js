import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";

export const DRAG_AND_DROP_MIME = "application/mikado-app";
export const DRAG_AND_DROP_MAGIC = "mikado-mikado";
export const DRAG_AND_DROP_EFFECT = "move";

function onDragStart(event) {
  event.dataTransfer.setData(DRAG_AND_DROP_MIME, DRAG_AND_DROP_MAGIC);
  event.dataTransfer.effectAllowed = DRAG_AND_DROP_EFFECT;
}

function MyDrawer({ selectionData }) {
  // TODO fix the swiping on desktop
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
      "Selected"
      :
      <div id="add-node-button" onDragStart={onDragStart} draggable>Add Node</div>
    }
  </SwipeableDrawer>;
  // TODO add onclick random insertion when drag and drop is not available, and implement that in a way that doesn't cancel on intersections
}

export default MyDrawer;
