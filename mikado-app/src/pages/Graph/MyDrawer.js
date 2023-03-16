import { SwipeableDrawer } from "@mui/material";
import "./MyDrawer.css";
import { useEffect, useRef } from "react";
import * as React from 'react';


function MyDrawer({ displayLayerHandle }) {
  // TODO fix the swiping on desktop
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    current && (current.value = displayLayerHandle.getSelectedNodeName());
  }, [displayLayerHandle]);
  const [drawerToggle, setDrawerToggle] = React.useState(false);
  
  const selectedNodeName = displayLayerHandle.getSelectedNodeName();
  useEffect(() => {
    setDrawerToggle(typeof selectedNodeName !== "undefined");
  }, [selectedNodeName])

  return <SwipeableDrawer
    open={drawerToggle}
    onClose={() => void 0}
    onOpen={() => void 0}
    anchor="bottom"
    variant="persistent"
    disableSwipeToOpen={false}
  >
    <div id="puller"></div>
    {drawerToggle && <input ref={ref} onChange={e => displayLayerHandle.setSelectedNodeName(e.target.value)} />}
  </SwipeableDrawer>;

}

export default MyDrawer;
