import * as React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, Divider, ListItemText, SwipeableDrawer, Button } from '@mui/material';
import { Mail, Inbox, Add } from '@mui/icons-material';

export default function GraphNavigationBar({open, setOpen}) {
	
	const toggleDrawer = (open) => (event) => {
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
	
		setOpen(open);
	};

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
					{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
					<ListItem key={text} disablePadding>
						<ListItemButton>
							<ListItemIcon>
							{index % 2 === 0 ? <Inbox /> : <Mail />}
							</ListItemIcon>
							<ListItemText primary={text} />
						</ListItemButton>
					</ListItem>
				))}
				</List>
				<Divider />
				<List>
					{['All mail', 'Trash', 'Spam'].map((text, index) => (
						<ListItem key={text} disablePadding>
							<ListItemButton>
								<ListItemIcon>
									{index % 2 === 0 ? <Inbox /> : <Mail />}
								</ListItemIcon>
								<ListItemText primary={text} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>
		</SwipeableDrawer>
	);
}