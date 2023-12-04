import * as React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, Divider, ListItemText, IconButton, SwipeableDrawer, Button } from '@mui/material';
import { Inbox, Add, Delete } from '@mui/icons-material';
import { getAllGraphs } from '../../../helpers/Api';

export default function GraphNavigationBar({open, setOpen, uid, switchGraph}) {

	const [graphs, setGraphs] = React.useState([]);
	
	const toggleDrawer = (open) => (event) => {
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
	
		setOpen(open);
	};

	React.useEffect(() => {
		const getGraphs = async () => {
			if (open == true) {
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
				<Button variant="contained" startIcon={<Add />}>Add Graph</Button>
			</Box>
			<Divider />
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
							<IconButton edge="end">
								<Delete />
							</IconButton>
						}
					>
						<ListItemButton onClick={() => switchGraph(id)}>
							<ListItemIcon>
								<Inbox />
							</ListItemIcon>
							<ListItemText primary={id} />
						</ListItemButton>
					</ListItem>
				))}
				</List>
				<Divider />
			</Box>
		</SwipeableDrawer>
	);
}