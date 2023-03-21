import * as React from 'react';
import { useEffect } from 'react';
import { AppBar, Container, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Tooltip, Avatar } from '@mui/material'
import AdbIcon from '@mui/icons-material/Adb';

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function AppMenu({ graphID }) {
  const [anchorUser, setAnchorUser] = React.useState(null);
  const [graphName, setGraphName] = React.useState("");

  useEffect(() => {
    setGraphName(graphID);
  }, [graphID])

  const handleOpenUserMenu = (event) => {
    setAnchorUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorUser(null);
  };

  return (
    <AppBar position="absolute">
      <Container maxWidth="x2">
        <Toolbar disableGutters>
          <Box
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              flexGrow: 1,
              display: 'flex',
            }}
          >
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {
                // Placeholder for now
              }
              {graphName}
            </Typography>

          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {
                  // TODO Add icon based on google account
                }
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default AppMenu;
