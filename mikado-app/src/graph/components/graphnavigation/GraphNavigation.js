import * as React from 'react';
import { Box, List, ListItem, ListItemButton, Divider, ListItemText, IconButton, SwipeableDrawer, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { getAllGraphs, addGraph, deleteGraph } from '../../../helpers/Api';
import './GraphNavigation.css';

export default function GraphNavigationBar({open, setOpen, uid, switchGraph}) {

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
				<Button className="add-doc-button" variant="outlined" startIcon={<Add fontSize='large'/>} onClick={() => setAddGraphDialogOpen(true)}>Add document</Button>
			</Box>
			{/* <Divider /> */}
			<Box
				sx={{ width: 'auto' }}
				role="presentation"
				onClick={toggleDrawer(false)}
				onKeyDown={toggleDrawer(false)}
			>
				<List>
					{graphs.map((id) => (
					<ListItem key={id} disablePadding
						secondaryAction={
							<IconButton edge="end" onClick={(e) => {
								e.stopPropagation();
								setDeleteConfirmationDialogOpen(true);
								setSelectedGraphToDelete(text);
							}}>
								<Delete sx={{color:'#fff', fontSize:'20px'}}/>
							</IconButton>
						}
					>
						<ListItemButton onClick={() => switchGraph(id)}>
							<ListItemIcon>
								<Inbox />
							</ListItemIcon>
							<ListItemText primary={id} />
						<ListItemButton>
							<ListItemText primary={text} />
						</ListItemButton>
					</ListItem>
				))}
				</List>
				<Divider />
			</Box>
			<Dialog
				className="add-graph-dialog" 
				open={isAddGraphDialogOpen} 
				onClose={() => {
					setAddGraphDialogOpen(false);
					setNewGraphName('');
					setGraphExists(false);
				}}
			>
				<DialogTitle>Create new document</DialogTitle>
				<DialogContent>
					<TextField
					autoFocus = {true}
					margin="dense"
					id="graphName"
					label="New Document Name"
					type="text"
					// color="theme"
					fullWidth
					value={newGraphName}
					onChange={(e) => {setNewGraphName(e.target.value);
					setGraphExists(false);}}
					error = {graphExists}
					helperText= {graphExists && `Graph "${newGraphName}" already exists, please select a new name.`}
					/>
				</DialogContent>
				<DialogActions>
					<Button 
						variant='outlined'
						color='inherit'	
					onClick={() => {
						setAddGraphDialogOpen(false);
						setNewGraphName('');
						setGraphExists(false);
						}}>Cancel</Button>
					<Button 
						variant='contained'
						onClick={handleAddGraph}>Add</Button>
				</DialogActions>
			</Dialog>
			<Dialog className="confirm-deletion-dialog"  open={deleteConfirmationDialogOpen} onClose={() => setDeleteConfirmationDialogOpen(false)}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
				<p>Are you sure you want to delete the following document?</p>
				<li><b>{selectedGraphToDelete}</b></li>
				<p>This action cannot be undone.</p>
				</DialogContent>
				<DialogActions>
					<Button variant="outlined" color="inherit" onClick={() => setDeleteConfirmationDialogOpen(false)}>Cancel</Button>
					<Button variant="contained" onClick={handleDeleteGraph} color="error">
					Delete
					</Button>
				</DialogActions>
			</Dialog>
		</SwipeableDrawer>
	);
}