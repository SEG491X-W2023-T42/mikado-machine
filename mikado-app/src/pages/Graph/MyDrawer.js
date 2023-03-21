import { Button, SwipeableDrawer, TextField } from "@mui/material";
import "./MyDrawer.css";
import { useEffect } from "react";
import * as React from 'react';


function MyDrawer({ displayLayerHandle }) {
  const [drawerToggle, setDrawerToggle] = React.useState(false);

  const selectedNodeName = displayLayerHandle.getSelectedNodeName();
  useEffect(() => {
    setDrawerToggle(typeof selectedNodeName !== "undefined");
  }, [selectedNodeName])

  // TODO Subgraph onclick
  return <SwipeableDrawer
    open={drawerToggle}
    onClose={() => void 0}
    onOpen={() => void 0}
    anchor="bottom"
    variant="persistent"
    disableSwipeToOpen={false}
  >
    <div id="puller"></div>
    {drawerToggle && <TextField id="filled-basic" label="Node Name" variant="filled" defaultValue={selectedNodeName} onChange={e => displayLayerHandle.setSelectedNodeName(e.target.value)} />}
    <Button>Create Subgraph</Button>
  </SwipeableDrawer>;
}

export default MyDrawer;
