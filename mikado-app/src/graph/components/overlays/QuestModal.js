import * as React from 'react';
import { Dialog, DialogActions, DialogTitle, Button, styled, IconButton, Typography, DialogContent, Grid, List, ListItem } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function QuestModal({ open, handleClose }) {

	const StyledDialog = styled(Dialog)(({ theme }) => ({
		'& .MuiDialogContent-root': {
			padding: theme.spacing(2),
		},
		'& .MuiDialogActions-root': {
			padding: theme.spacing(1),
		},
	}));

	return (
		<StyledDialog
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
			<DialogContent dividers>
        <h1>Current Quest {/*TODO %*/}</h1>
        <Grid container justifyContent="space-between">
          <Grid item>Mytask {/*Current Task*/}</Grid>
          <Grid item>Mytask {/*Next Task*/}</Grid>
          <Grid item>{/* Spacer */}</Grid>
        </Grid>
			</DialogContent>
			<DialogContent dividers>
        <h1>Other Quests {/*TODO %*/}</h1>
        <List disablePadding>
          <ListItem>Mytask {/*TODO %*/}</ListItem>
          <ListItem>Mytask {/*TODO %*/}</ListItem>
          <ListItem>Mytask {/*TODO %*/}</ListItem>
        </List>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} autoFocus>Back</Button>
			</DialogActions>
		</StyledDialog>
	);
}
