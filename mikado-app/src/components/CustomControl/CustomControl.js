import * as React from 'react';
import { ControlButton, Controls } from "reactflow";
import SaveIcon from '@mui/icons-material/Save';

function CustomControl(props) {
  return (
    <Controls>
      <ControlButton onClick={props.onClick}>
        <SaveIcon />
      </ControlButton>
    </Controls>
  );
}

export default CustomControl;
