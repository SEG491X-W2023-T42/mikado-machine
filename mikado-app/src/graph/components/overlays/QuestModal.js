import * as React from 'react';
import { Dialog, DialogActions, DialogTitle, Button, styled, IconButton, DialogContent, Grid, List, ListItem, ListItemButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useStoreHack } from "../../../context/StoreHackContext";
import { shallow } from "zustand/shallow";

export const NO_TASKS_TEXT = "Connect a non-complete node to the Goal Node to start a new Quest!";
const NO_NEXT_TASK_TEXT = "Profit!";

const selector = (store) => ({
  operations: store.operations,
  currentQuestlineId: store.currentQuestlineId,
  currentTwoTasks: store.currentTwoTasks,
});

/**
 * Inner component to prevent flashes changing the questline
 */
function QuestModalInner() {
  const { operations, currentQuestlineId, currentTwoTasks: [task1, maybeTask2] } = useStoreHack()(selector, shallow);
  const task2 = maybeTask2 ?? (task1 && operations.getOneNodeParent(task1.id));

  return <>
    <DialogContent dividers>
      <h1>Current Quest {/*TODO %*/}</h1>
      <Grid container justifyContent="space-between">
        <Grid item className="questlineTask">{task1?.data?.label ?? NO_TASKS_TEXT /*Current Task*/}</Grid>
        <Grid item className="questlineTask">{task2?.data?.label ?? NO_NEXT_TASK_TEXT /*Next Task*/}</Grid>
        <Grid item>{/* Spacer */}</Grid>
      </Grid>
    </DialogContent>
    <DialogContent dividers>
      <h1>Other Quests</h1>
      <List disablePadding>
        {
          operations.getAllQuests().flatMap(parent => {
            const { id, data: { label } } = parent;
            if (id === currentQuestlineId) return [];
            return [<ListItemButton key={id} onClick={() => operations.setCurrentQuestlineId(id)}>
              <ListItem>{label} {/*TODO %*/}</ListItem>
            </ListItemButton>];
          })
        }
      </List>
    </DialogContent>
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
      {"Questline Details"}
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
