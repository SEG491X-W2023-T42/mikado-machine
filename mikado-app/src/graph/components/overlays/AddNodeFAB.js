import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

export default function AddNodeFab({ onClick }) {
	return <Fab
    color="primary"
    sx={{
      position: "absolute",
      bottom: 0,
      right: 0,
      margin: 5,
    }}
    onClick={onClick}
  >
    <AddIcon />
  </Fab>;
}