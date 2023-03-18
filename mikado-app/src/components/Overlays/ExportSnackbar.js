import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import MuiAlert from "@mui/material/Alert";

const SUCCESS_MSG = "Graph exported successfully!"
const ERROR_MSG = "There was an error exporting the graph. Please try again.";
const ANCHOR_ORIGIN = { vertical: "bottom", horizontal: "center" };
const ALERT_SX = { width: '100%' };

function useExportSnackbar() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleToastClose(event, reason) {
    reason !== 'clickaway' && setOpen(false);
  }

  function exportNotifySuccessElseError(success) {
    setSuccess(success);
    setOpen(true);
  }

  // noinspection JSValidateTypes // handleToastClose
  const exportSnackbar = <Snackbar anchorOrigin={ANCHOR_ORIGIN} open={open} autoHideDuration={6000} onClose={handleToastClose}>
    <MuiAlert elevation={6} variant="filled" onClose={handleToastClose} severity={success ? "success" : "error"} sx={ALERT_SX}>
      {success ? SUCCESS_MSG : ERROR_MSG}
    </MuiAlert>
  </Snackbar>;
  return [exportSnackbar, exportNotifySuccessElseError];
}

export default useExportSnackbar;
