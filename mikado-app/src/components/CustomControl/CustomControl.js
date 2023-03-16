import * as React from 'react';
import { ControlButton, Controls } from "reactflow";
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

function CustomControl(props) {
  return (
    <Controls position="top-right">
      <ControlButton onSaveClick={props.onSaveClick}>
        <SaveIcon />
      </ControlButton>
      <ControlButton>
        <PictureAsPdfIcon onExportClick={props.onExportClick}/>
      </ControlButton>
    </Controls>
  );
}

export default CustomControl;
