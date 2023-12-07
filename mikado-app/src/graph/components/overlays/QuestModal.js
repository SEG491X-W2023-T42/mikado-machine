import * as React from 'react';
import { Box, Dialog, Divider, ListItemText, DialogActions, DialogTitle, Button, styled, IconButton, DialogContent, List, ListItem, Typography, LinearProgress } from '@mui/material';
import { Close, ArrowForward } from '@mui/icons-material';
import { useStoreHack } from "../../../context/StoreHackContext";
import { shallow } from "zustand/shallow";
import './QuestModal.css' 

export const NO_TASKS_TEXT = "Connect a non-complete node to the Goal Node to start a new Quest!";
const NO_NEXT_TASK_TEXT = "Profit!";

const selector = (store) => ({
  operations: store.operations,
  currentQuestlineId: store.currentQuestlineId,
  currentTwoTasks: store.currentTwoTasks,
});

function LinearProgressWithLabel(props) {
	return (
    
		<Box sx={{ display: 'flex', flexDirection:'column', alignItems: 'left', width:'100%' }}>
      <Typography className='quest-dialog-subtitle'>Quest Progress</Typography>
			<Box sx={{ display:'flex', flexDirection:'row', width: 'auto', mr: 1 , marginLeft:'16px', marginRight:'16px', marginTop:'8px'}}>
				<LinearProgress variant="determinate" {...props} sx={{width:'100%', alignSelf:'center'}}/>
        <Box sx={{marginLeft:'8px'}}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(props.value,)}%`}
          </Typography>
        </Box>
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
		{<Typography className='quest-dialog-subtitle'>Other Quests</Typography>}
      <List disablePadding>
        {
          operations.getAllQuests().flatMap((parent, i) => {
            const { id, data: { label } } = parent;
            if (id === currentQuestlineId) return [];
            return [
				<div key={id}>
					<ListItem
						secondaryAction={
							<IconButton color='inherit' edge="end" onClick={() => operations.setCurrentQuestlineId(id)}>
								<ArrowForward />
							</IconButton>
						}
					>
						<ListItemText primary={
							<React.Fragment>
								<Typography sx={{ display: 'inline' }}>
									{label}
								</Typography>
								<Typography color="text.secondary" align="right" sx={{ display: 'inline', marginRight:0}}>
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
    className='quest-modal'
    open={open}
    onClose={handleClose}
    fullWidth={true}
    maxWidth={'sm'}
  >
    <DialogTitle>
      {<Typography className='quest-dialog-title'>Questline Details</Typography>}
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
      <Button onClick={handleClose} color='inherit' autoFocus>Back</Button>
    </DialogActions>
  </StyledDialog>;
}
