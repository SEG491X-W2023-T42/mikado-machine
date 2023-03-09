import DisplayLayer from "./DisplayLayer";
import "./Plaza.css";
import useSnackbar from "./MySnackbar";
import MyDrawer from "./MyDrawer";
import { useState } from "react";
import DisplayLayerHandle from "./DisplayLayerHandle";

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
  // Wires the active DisplayLayer to the bottom panel
  // Any inactive DisplayLayer can receive a noop callback
  const [displayLayerHandle, setDisplayLayerHandle] = useState(new DisplayLayerHandle());

  return <main>
    <DisplayLayer key={uid} uid={uid} notifySuccessElseError={notifySuccessElseError} setDisplayLayerHandle={setDisplayLayerHandle} />
    {snackbar}
    <MyDrawer displayLayerHandle={displayLayerHandle} />
  </main>
}

export default Plaza;
