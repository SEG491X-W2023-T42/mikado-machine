import Chip from '@mui/material/Chip';

export default function QuestOverlay({ currentTask }) {
	return <Chip
	label={currentTask == undefined || currentTask.length == 0 ? "Loading..." : currentTask[0].data.label}
	sx={{
		position: "absolute",
		top: 50,
		left: 50,
		margin: 5,
	}}
	/>
}