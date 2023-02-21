import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";
import { useEffect, useRef } from "react";

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
      "Not Selected"
    }
  </SwipeableDrawer>
}

export default MyDrawer;
