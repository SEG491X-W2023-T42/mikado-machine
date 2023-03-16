import { useEffect, useRef } from "react";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

function Overlay({ displayLayerHandle }) {
  // TODO fix the swiping on desktop
  const ref = useRef();
  useEffect(() => {
    const { current } = ref;
    current && (current.value = displayLayerHandle.getSelectedNodeName());
  }, [displayLayerHandle]);

  return (

    <Fab color="primary">
      <AddIcon />
    </Fab>

  );

}

export default Overlay;
