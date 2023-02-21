import DisplayLayer from "./DisplayLayer";
import "./Plaza.css";
import useSnackbar from "./MySnackbar";

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

  return <main>
    <DisplayLayer uid={uid} notifySuccessElseError={notifySuccessElseError} />
    {snackbar}
  </main>
}

export default Plaza;