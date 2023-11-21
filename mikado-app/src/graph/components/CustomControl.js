import * as React from 'react';
import { ControlButton, Controls } from "reactflow";

function CustomControl(props) {
  return (
    <Controls position="top-right" style={{ marginTop: "75px" }}>
      <ControlButton onClick={props.onExportClick} aria-label="Print" data-icon="print" />
    </Controls>
  );
}

export default CustomControl;
