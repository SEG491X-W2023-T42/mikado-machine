import { Button, ButtonGroup } from '@mui/material'
import './QuestOverlay.css'

export default function QuestOverlay({ currentTask, completeClick }) {
	return (
		<div className="overlay">
			<h2>Current Task:</h2>
			<h3>{currentTask == undefined || currentTask.length == 0 ? "Connect a non-complete node to the Goal Node to start a new Quest!" : currentTask[0].data.label}</h3>
			<ButtonGroup variant="contained">
				<Button sx={{fontFamily: 'Inter', fontWeight: 'bold'}} onClick={completeClick} disabled={currentTask == undefined || currentTask.length == 0}>Complete</Button>
				<Button sx={{fontFamily: 'Inter', fontWeight: 'bold'}}>See More</Button>
			</ButtonGroup>
		</div>
	)

}