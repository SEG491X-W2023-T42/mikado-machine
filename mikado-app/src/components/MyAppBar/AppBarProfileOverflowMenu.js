import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import * as React from "react";
import { useFirebase } from '../../context/FirebaseContext';

const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export default function AppBarProfileOverflowMenu() {
  const [anchorUser, setAnchorUser] = React.useState(null);
  const { logOut } = useFirebase();

  const handleOpenUserMenu = (event) => {
    setAnchorUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorUser(null);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  const settingsFunctions = [handleCloseUserMenu, handleCloseUserMenu, handleCloseUserMenu, handleSignOut];

  return <Box sx={{ flexGrow: 0 }}>
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
      open={!!anchorUser}
      onClose={handleCloseUserMenu}
    >
      {settings.map((setting, index) => (
        <MenuItem key={setting} onClick={settingsFunctions[index]}>
          <Typography textAlign="center">{setting}</Typography>
        </MenuItem>
      ))}
    </Menu>
  </Box>;
}
