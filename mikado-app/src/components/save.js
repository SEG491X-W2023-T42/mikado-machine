import * as React from 'react';
import { ControlButton, Controls } from "reactflow";
import save from '../resources/save.png';

function CustomControl() {
    return (
        <Controls>
            <ControlButton onClick={() => console.log("test")}>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
            </ControlButton>
        </Controls>
    );
}

export default CustomControl;