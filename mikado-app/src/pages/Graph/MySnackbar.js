import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import MuiAlert from "@mui/material/Alert";

const ANCHOR_ORIGIN = { vertical: "bottom", horizontal: "center" };
const ALERT_SX = { width: '100%' };

function useSnackbar(error_msg) {
  const [open, setOpen] = useState(false);

  function handleToastClose(event, reason) {
    reason !== 'clickaway' && setOpen(false);
  }

  function notifyError() {
    setOpen(true);
  }

  // noinspection JSValidateTypes // handleToastClose
  const snackbar = <Snackbar anchorOrigin={ANCHOR_ORIGIN} open={open} autoHideDuration={6000} onClose={handleToastClose}>
    <MuiAlert elevation={6} variant="filled" onClose={handleToastClose} severity="error" sx={ALERT_SX}>
      {error_msg}
    </MuiAlert>
  </Snackbar>;

  return [snackbar, notifyError];
}

export default useSnackbar;
