import * as React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, Divider, ListItemText, IconButton, SwipeableDrawer, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Inbox, Add, Delete } from '@mui/icons-material';
import { getAllGraphs, addGraph, deleteGraph } from '../../../helpers/Api';

export default function GraphNavigationBar({open, setOpen, uid}) {

	const [graphs, setGraphs] = React.useState([]);
	const [isAddGraphDialogOpen, setAddGraphDialogOpen] = React.useState(false);
	const [newGraphName, setNewGraphName] = React.useState('');
	const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = React.useState(false);
	const [selectedGraphToDelete, setSelectedGraphToDelete] = React.useState('');
	const [graphExists, setGraphExists] = React.useState(false);
	
	const toggleDrawer = (open) => (event) => {
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
		
		setOpen(open);
	};

	const handleAddGraph = async () => {
		try {
			const allGraphs = await getAllGraphs(uid);
			
			if (allGraphs.includes(newGraphName)) {
				setGraphExists(true);
				return;
			}

			await addGraph(uid, newGraphName);

			//reload
			const updatedGraphs = await getAllGraphs(uid);
			setGraphs(updatedGraphs);

			setNewGraphName('');
			setGraphExists(false);

			setAddGraphDialogOpen(false);
		} catch (error) {
			console.error('Error adding graph: ', error);
		}
	};

	const handleDeleteGraph = async () => {
		try {
			await deleteGraph(uid, selectedGraphToDelete);

			//reload
			const allGraphs = await getAllGraphs(uid);
			setGraphs(allGraphs);

			setDeleteConfirmationDialogOpen(false);
			setSelectedGraphToDelete('');

		} catch (error) {
			console.error("Error deleting graph: ", error);
		}
	};

	React.useEffect(() => {
		const getGraphs = async () => {
			if (open === true) {
				const allGraphs = await getAllGraphs(uid)
				setGraphs(allGraphs);
			}
		}

		getGraphs().catch(console.error)
	}, [open])

	return (
		<SwipeableDrawer
			open={open}
			onClose={toggleDrawer(false)}
            onOpen={toggleDrawer(true)}
		>
			<Box
				sx={{ width: 'auto' }}
				role="presentation"
			>
				<Button variant="contained" startIcon={<Add />} onClick={() => setAddGraphDialogOpen(true)}>Add Graph</Button>
			</Box>
			<Divider />
			<Box
				sx={{ width: 'auto' }}
				role="presentation"
				onClick={toggleDrawer(false)}
				onKeyDown={toggleDrawer(false)}
			>
				<List>
					{graphs.map((text) => (
					<ListItem key={text} disablePadding
						secondaryAction={
							<IconButton edge="end" onClick={(e) => {
								e.stopPropagation();
								setDeleteConfirmationDialogOpen(true);
								setSelectedGraphToDelete(text);
							}}>
								<Delete />
							</IconButton>
						}
					>
						<ListItemButton>
							<ListItemIcon>
								<Inbox />
							</ListItemIcon>
							<ListItemText primary={text} />
						</ListItemButton>
					</ListItem>
				))}
				</List>
				<Divider />
			</Box>
			<Dialog open={isAddGraphDialogOpen} onClose={() => {
				setAddGraphDialogOpen(false);
				setNewGraphName('');
				setGraphExists(false);
			}}>
				<DialogTitle>Add Graph</DialogTitle>
				<DialogContent>
				<TextField
				autoFocus
				margin="dense"
				id="graphName"
				label="Graph Name"
				type="text"
				fullWidth
				value={newGraphName}
				onChange={(e) => {setNewGraphName(e.target.value);
				setGraphExists(false);}}
				error = {graphExists}
				helperText= {graphExists && `Graph "${newGraphName}" already exists, please select a new name.`}
				/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {
						setAddGraphDialogOpen(false);
						setNewGraphName('');
						setGraphExists(false);
						}}>Cancel</Button>
					<Button onClick={handleAddGraph}>Add</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={deleteConfirmationDialogOpen} onClose={() => setDeleteConfirmationDialogOpen(false)}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
				<p>Are you sure you want to delete the graph &quot;{selectedGraphToDelete}&quot;?</p>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteConfirmationDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDeleteGraph} color="error">
					Delete
					</Button>
				</DialogActions>
			</Dialog>
		</SwipeableDrawer>
	);
}