
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
  var DEFAULT_GRAPH_ID = "graph-1";

  // Wires the active DisplayLayer to the bottom panel
  // Any inactive DisplayLayer can receive a noop callback
  // eslint-disable-next-line no-unused-vars
  const [displayLayerHandle, setDisplayLayerHandle] = useState(new DisplayLayerHandle());
  // eslint-disable-next-line no-unused-vars
  const [graphID, setGraphID] = useState(DEFAULT_GRAPH_ID);

  return <main>
    <AppMenu graphID={graphID} />
      <DisplayLayer key={uid} uid={uid} 
        notifySuccessElseError={notifySuccessElseError} 
        fabNotifySuccessElseError={fabNotifySuccessElseError}
        exportNotifySuccessElseError={exportNotifySuccessElseError} 
        setDisplayLayerHandle={setDisplayLayerHandle} 
        graphName={graphID}
      />
    {snackbar}
    {fabSnackbar}
    {exportSnackbar}

    <MyDrawer displayLayerHandle={displayLayerHandle} />

  </main>

  
}

export default Plaza;
