
import DisplayLayer from "./DisplayLayer";
import "./Plaza.css";
import useSnackbar from "./MySnackbar";
import { useState } from "react";
import DisplayLayerHandle from "./DisplayLayerHandle";
import useFABSnackbar from "../../components/Overlays/FABSnackbar";
//import MyDrawer from "./MyDrawer";

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
  // Wires the active DisplayLayer to the bottom panel
  // Any inactive DisplayLayer can receive a noop callback
  // eslint-disable-next-line no-unused-vars
  const [displayLayerHandle, setDisplayLayerHandle] = useState(new DisplayLayerHandle());
  return <main>
    <DisplayLayer key={uid} uid={uid} notifySuccessElseError={notifySuccessElseError} fabNotifySuccessElseError={fabNotifySuccessElseError} setDisplayLayerHandle={setDisplayLayerHandle} />
    {snackbar}
    {fabSnackbar}
    {// remove this and the braces when needed
      //<MyDrawer setDisplayLayerHandle={setDisplayLayerHandle} />
    }
  </main>
}

export default Plaza;
