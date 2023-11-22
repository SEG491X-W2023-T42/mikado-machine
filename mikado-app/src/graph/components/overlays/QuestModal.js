import * as React from 'react';
import { Dialog, DialogActions, DialogTitle, Button, styled, IconButton, Typography, DialogContent } from '@mui/material';
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
				Section 1
			</DialogContent>
			<DialogContent dividers>
				Section 2
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} autoFocus>Save changes</Button>
			</DialogActions>
		</StyledDialog>
	);
}