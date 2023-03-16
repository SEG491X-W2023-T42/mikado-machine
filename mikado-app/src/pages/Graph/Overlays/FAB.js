import { useEffect, useRef } from "react";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

function FAB({ displayLayerHandle, onClick }) {
  // TODO fix the swiping on desktop
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    current && (current.value = displayLayerHandle.getSelectedNodeName());
  }, [displayLayerHandle]);

  return (

    <Fab 
        color="primary" 
        sx={{
            position: "absolute", 
            bottom: 0, 
            right: 0, 
            margin: 5
        }}
        onClick={onClick}
        >
      <AddIcon />
    </Fab>

  );

}

export default FAB;
