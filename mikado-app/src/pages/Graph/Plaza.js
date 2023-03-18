
import DisplayLayer from "./DisplayLayer";
import "./Plaza.css";
import useSnackbar from "./MySnackbar";
import { useState } from "react";
import * as React from 'react';
import DisplayLayerHandle from "./DisplayLayerHandle";
import useFABSnackbar from "../../components/Overlays/FABSnackbar";
import useExportSnackbar from "../../components/Overlays/ExportSnackbar";
import MyDrawer from "./MyDrawer";
import AppMenu from "../../components/AppMenu"

/**
 * The Plaza component is the main page that users view and edit graphs.
 *
 * Most of the time the user may just see one DisplayLayer be the whole thing.
 * The difference between Graph and DisplayLayer is that the Plaza normally persists throughout
 * an editing session of one Mikado, while the DisplayLayer may be destroyed when entering subtrees.
 * Plaza may also be responsible for animating tow DisplayLayers, one exiting and one entering.
 * It also contains the bottom sheet.
 */
function Plaza({ uid }) {
  const [snackbar, notifySuccessElseError] = useSnackbar();
  const [fabSnackbar, fabNotifySuccessElseError] = useFABSnackbar();
  const [exportSnackbar, exportNotifySuccessElseError] = useExportSnackbar();

  /**
   * The default Mikado to open.
   *
   * For now this default graph is the only graph available until saving/multiple different files/documents is implemented.
   * Also, there is only one layer of the graph available until the subtrees feature is implemented.
   */
  // eslint-disable-next-line no-unused-vars
  const DEFAULT_GRAPH_ID = "graph-1";

  // Wires the active DisplayLayer to the bottom panel
  // Any inactive DisplayLayer can receive a noop callback
  const [displayLayerHandle, setDisplayLayerHandle] = useState(new DisplayLayerHandle());
  
  // eslint-disable-next-line no-unused-vars
  const [graphID, setGraphID] = useState(DEFAULT_GRAPH_ID);
  const [fade, setFade] = useState(false);
  const [graphTransition, setGraphTransition] = useState({startFrom: "in", transitionIn: false, transitionOut: false, pos: {x: 0, y: 0}, nodeID: 0})
  const [animation, setAnimation] = useState({});

  // Rudimentary transition. Not optimal, want to look into procedural anim based on
  // when the db finishes loading
  function transitionInto(graph) {
    // Zoom in anim
    setGraphTransition({
      startFrom: "in", 
      transitionOut: false, transitionIn: true, 
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    });

    // Changing graph transition
    
    setTimeout(() => setAnimation({
      animate: {
        opacity: [null, 0, 0, 1]
      }, 
      transition: {
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        repeat: 0
      }
    }), 600)
    setTimeout(() => setGraphID(graph), 1000)

    // Zoom out to fit
    setTimeout(() => setGraphTransition({
      startFrom: "in",
      transitionOut: true, transitionIn: false, 
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    }), 1600);
    setTimeout(() => setGraphTransition({
      startFrom: "in",
      transitionOut: false, transitionIn: false, 
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    }), 1900);
  }

  function transitionOutOf(graph) {
    // Zoom out anim
    setGraphTransition({
      startFrom: "out", 
      transitionOut: true, transitionIn: false,
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    });

    // Changing graph transition
    setTimeout(() => setAnimation({
      animate: {
        opacity: [null, 0, 0, 1]
      }, 
      transition: {
        duration: 2,
        times: [0, 0.2, 0.8, 1],
        repeat: 0
      }
    }), 600)
    setTimeout(() => setGraphID(graph), 1000)

    // Zoom to fit
    setTimeout(() => setGraphTransition({
      startFrom: "out", 
      transitionOut: false, transitionIn: true, 
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    }), 1600);
    setTimeout(() => setGraphTransition({
      startFrom: "out", 
      transitionOut: false, transitionIn: false, 
      pos: displayLayerHandle.getSelectedNodePos(), 
      nodeID: displayLayerHandle.getSelectedNodeID()
    }), 1900);
  }

  return <main>
    <AppMenu graphID={graphID} />
    
    <DisplayLayer key={uid} uid={uid} 
      notifySuccessElseError={notifySuccessElseError} 
      fabNotifySuccessElseError={fabNotifySuccessElseError}
      exportNotifySuccessElseError={exportNotifySuccessElseError} 
      setDisplayLayerHandle={setDisplayLayerHandle} 
      graphName={graphID}
      animation={animation}
      graphTransition={graphTransition}
    />
    
    {snackbar}
    {fabSnackbar}
    {exportSnackbar}

    <MyDrawer displayLayerHandle={displayLayerHandle} drawerButtonClick={() => {transitionInto("graph-2")}}/>

  </main>

  
}

export default Plaza;
