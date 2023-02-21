import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";

function MyDrawer() {
  // TODO fix the swiping on desktop
  return <SwipeableDrawer
    open={true}
    onClose={() => void 0}
    onOpen={() => void 0}
    anchor="bottom"
    variant="persistent"
    drawerBleeding={56}
    disableSwipeToOpen={false}
  >
    <div id="puller"></div>
    Hello
  </SwipeableDrawer>
}

export default MyDrawer;
