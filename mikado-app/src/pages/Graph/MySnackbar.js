import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import MuiAlert from "@mui/material/Alert";

const SUCCESS_MSG = "Graph successfully saved!";
const ERROR_MSG = "There was a problem saving your graph. Please check console for more details.";
const ANCHOR_ORIGIN = { vertical: "bottom", horizontal: "center" };
const ALERT_SX = { width: '100%' };

function useSnackbar() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleToastClose(event, reason) {
    reason !== 'clickaway' && setOpen(false);
  }

  function notifySuccessElseError(success) {
    setSuccess(success);
    setOpen(true);
  }

  // noinspection JSValidateTypes // handleToastClose
  const snackbar = <Snackbar anchorOrigin={ANCHOR_ORIGIN} open={open} autoHideDuration={6000} onClose={handleToastClose}>
    <MuiAlert elevation={6} variant="filled" onClose={handleToastClose} severity={success ? "success" : "error"} sx={ALERT_SX}>
      {success ? SUCCESS_MSG : ERROR_MSG}
    </MuiAlert>
  </Snackbar>;

  return [snackbar, notifySuccessElseError];
}

export default useSnackbar;
