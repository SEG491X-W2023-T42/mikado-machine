import * as React from 'react';
import { ControlButton, Controls } from "reactflow";
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function CustomControl(props) {
  return (
    <Controls position="top-right" style={{ marginTop: "75px" }}>
      <ControlButton onClick={props.onSaveClick}>
        <SaveIcon />
      </ControlButton>
      <ControlButton onClick={props.onExportClick}>
        <PictureAsPdfIcon />
      </ControlButton>
    </Controls>
  );
}

export default CustomControl;
