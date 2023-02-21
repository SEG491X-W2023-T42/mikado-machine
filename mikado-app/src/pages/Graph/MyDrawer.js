import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";

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
      "Not Selected"
    }
  </SwipeableDrawer>
}

export default MyDrawer;
