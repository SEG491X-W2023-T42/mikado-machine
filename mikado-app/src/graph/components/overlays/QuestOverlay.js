import { Button, Typography } from '@mui/material'
import QuestModal, { NO_TASKS_TEXT } from './QuestModal';
import './QuestOverlay.css'
import { useStoreHack } from "../../../context/StoreHackContext";
import { shallow } from "zustand/shallow";
import { useState } from "react";

const selector = (store) => store.currentTwoTasks;

/**
 * Inner component to prevent flashes changing the questline
 */
function QuestOverlayInner({ handleClickOpen }) {
  const [currentTask] = useStoreHack()(selector, shallow);
  return <Button variant="outlined" className="overlay" onClick={handleClickOpen}>
    <h1>Current Quest:</h1>
    <Typography variant="h5" fontFamily="Inter">{currentTask?.data?.label ?? NO_TASKS_TEXT}</Typography>
    {/*TODO idk why the following code is there, but it wasn't in the design*/}
    {/*<ButtonGroup variant="contained">*/}
    {/*	<Button sx={{fontFamily: 'Inter', fontWeight: 'bold'}} onClick={completeClick} disabled={currentTask == undefined || currentTask.length == 0}>Complete</Button>*/}
    {/*	<Button sx={{fontFamily: 'Inter', fontWeight: 'bold'}} disabled={currentTask == undefined || currentTask.length == 0} onClick={handleClickOpen}>See More</Button>*/}
    {/*</ButtonGroup>*/}
  </Button>;
}

export default function QuestOverlay() {
  const [open, setOpen] = useState(false);

  return <>
    <QuestOverlayInner handleClickOpen={() => setOpen(true)} />
    <QuestModal open={open} handleClose={() => setOpen(false)} />
  </>;
}
