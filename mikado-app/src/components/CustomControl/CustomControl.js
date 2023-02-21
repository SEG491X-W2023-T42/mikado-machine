import * as React from 'react';
import { ControlButton, Controls } from "reactflow";
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout'; 

function CustomControl(props) {
  return (
    <Controls>
      <ControlButton onClick={props.onSaveClick}>
        <SaveIcon />
      </ControlButton>
      <ControlButton onClick={props.onLogoutClick}>
        <LogoutIcon />
      </ControlButton>
    </Controls>
  );
}

export default CustomControl;
