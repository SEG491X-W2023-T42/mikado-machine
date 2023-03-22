import { SnackbarContent, SnackbarProvider, useSnackbar } from "notistack";
import * as React from "react";
import { forwardRef } from "react";
import MuiAlert from "@mui/material/Alert";

const SNACKBAR_ANCHOR_ORIGIN = { vertical: "bottom", horizontal: "center" };
const ALERT_SX = { width: '100%' };

const MyAlert = forwardRef(function MyAlert({ id, message }, ref) {
  const { closeSnackbar } = useSnackbar();
  return <SnackbarContent ref={ref}>
    <MuiAlert elevation={6} variant="filled" onClose={() => closeSnackbar(id)} severity="error" sx={ALERT_SX}>
      {message}
    </MuiAlert>
  </SnackbarContent>;
});

const SNACKBAR_COMPONENTS = {
  default: MyAlert,
};

export default function NotificationManager() {
  return <SnackbarProvider
    anchorOrigin={SNACKBAR_ANCHOR_ORIGIN}
    autoHideDuration={6000}
    Components={SNACKBAR_COMPONENTS}
    maxSnack={10}
  />;
}
