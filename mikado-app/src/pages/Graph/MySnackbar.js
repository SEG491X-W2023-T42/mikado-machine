import Snackbar from "@mui/material/Snackbar";
import { forwardRef, useState } from "react";
import MuiAlert from "@mui/material/Alert";

function useSnackbar() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
  })

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessOpen(false);
    setErrorOpen(false);
  }

  const snackbar = <>
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={successOpen}
      autoHideDuration={6000}
      onClose={handleToastClose}
    >
      <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
        Graph sucessfully saved!
      </Alert>
    </Snackbar>

    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={errorOpen}
      autoHideDuration={6000}
      onClose={handleToastClose}
    >
      <Alert onClose={handleToastClose} severity="error" sx={{ width: '100%' }}>
        There was a problem saving your graph. Please check console for more details.
      </Alert>
    </Snackbar>
  </>;

  return [snackbar, setSuccessOpen, setErrorOpen];
}

export default useSnackbar;
