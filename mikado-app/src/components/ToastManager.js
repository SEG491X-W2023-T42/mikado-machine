import { enqueueSnackbar, SnackbarContent, SnackbarProvider, useSnackbar } from "notistack";
import * as React from "react";
import { forwardRef } from "react";
import MuiAlert from "@mui/material/Alert";
import { Grow } from "@mui/material";

const SNACKBAR_ANCHOR_ORIGIN = { vertical: "bottom", horizontal: "center" };
const ALERT_SX = { width: '100%' };

/**
 * The customized toast component, used to ensure the toast matches MUI.
 */
const MyAlert = forwardRef(function MyAlert({ id, message, style }, ref) {
  const { closeSnackbar } = useSnackbar();
  return <SnackbarContent ref={ref} style={style}>
    <MuiAlert elevation={6} variant="filled" onClose={() => closeSnackbar(id)} severity="error" sx={ALERT_SX}>
      {message}
    </MuiAlert>
  </SnackbarContent>;
});

const SNACKBAR_COMPONENTS = {
  default: MyAlert,
};

/**
 * A component that shows the toasts and applies the settings.
 */
export default function ToastManager() {
  return <SnackbarProvider
    anchorOrigin={SNACKBAR_ANCHOR_ORIGIN}
    autoHideDuration={6000}
    Components={SNACKBAR_COMPONENTS}
    maxSnack={10}
    TransitionComponent={Grow}
  />;
}

/**
 * Shows an error toast.
 *
 * This shows the toast on the global notification instance, spanning opened graphs and even users.
 */
export function notifyError(msg) {
  // Drop extra arguments and return value
  enqueueSnackbar(msg);
}
