import * as React from 'react';
import { Box, Dialog, Divider, ListItemText, DialogActions, DialogTitle, Button, styled, IconButton, DialogContent, Grid, List, ListItem, ListItemButton, Typography, LinearProgress } from '@mui/material';
import { Close, ArrowForward } from '@mui/icons-material';
import { useStoreHack } from "../../../context/StoreHackContext";
import { shallow } from "zustand/shallow";

export const NO_TASKS_TEXT = "Connect a non-complete node to the Goal Node to start a new Quest!";
const NO_NEXT_TASK_TEXT = "Profit!";

const selector = (store) => ({
  operations: store.operations,
  currentQuestlineId: store.currentQuestlineId,
  currentTwoTasks: store.currentTwoTasks,
});

function LinearProgressWithLabel(props) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Box sx={{ width: '100%', mr: 1 }}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box sx={{ minWidth: 35 }}>
				<Typography variant="body2" color="text.secondary">{`${Math.round(
					props.value,
				)}%`}</Typography>
			</Box>
		</Box>
	);
  }

/**
 * Inner component to prevent flashes changing the questline
 */
function QuestModalInner() {
  const { operations, currentQuestlineId, currentTwoTasks: [task1, maybeTask2] } = useStoreHack()(selector, shallow);
  const task2 = maybeTask2 ?? (task1 && operations.getOneNodeParent(task1.id));

  return <>
    <DialogContent dividers>
		<LinearProgressWithLabel variant="determinate" value={operations.getQuestlineProgress()[currentQuestlineId]} />
		<List sx={{ width: '100%' }}>
			<ListItem>
				<ListItemText primary="Current Task" secondary={task1?.data?.label ?? NO_TASKS_TEXT} />
			</ListItem>
			<Divider variant="inset" compoennt="li" />
			<ListItem>
				<ListItemText primary="Next Task" secondary={task2?.data?.label ?? NO_NEXT_TASK_TEXT } />
			</ListItem>
		</List>
    </DialogContent>
    { operations.getAllQuests().length > 1 && <DialogContent dividers>
		{<Typography variant="h4" fontFamily="Inter">Other Quests</Typography>}
      <List disablePadding>
        {
          operations.getAllQuests().flatMap((parent, i) => {
            const { id, data: { label } } = parent;
            if (id === currentQuestlineId) return [];
            return [
				<div key={id}>
					<ListItem
						secondaryAction={
							<IconButton edge="end" onClick={() => operations.setCurrentQuestlineId(id)}>
								<ArrowForward />
							</IconButton>
						}
					>
						<ListItemText primary={
							<React.Fragment>
								<Typography sx={{ display: 'inline' }}>
									{label}
								</Typography>
								<Typography color="text.secondary" align="right" sx={{ display: 'inline'}}>
									&nbsp;- {operations.getQuestlineProgress()[id]}%
								</Typography>
							</React.Fragment>
						} />
					</ListItem>
					{ operations.getAllQuests().length - 1 != i && <Divider compoennt="li" /> }
				</div>
            ];
          })
        }
      </List>
    </DialogContent> }
  </>;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function QuestModal({ open, handleClose }) {
  return <StyledDialog
    open={open}
    onClose={handleClose}
    fullWidth={true}
    maxWidth={'sm'}
  >
    <DialogTitle>
      {<Typography variant="h4" fontFamily="Inter">Questline Details</Typography>}
    </DialogTitle>
    <IconButton
      aria-label="close"
      onClick={handleClose}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <Close />
    </IconButton>
    <QuestModalInner />
    <DialogActions>
      <Button onClick={handleClose} autoFocus>Back</Button>
    </DialogActions>
  </StyledDialog>;
}
