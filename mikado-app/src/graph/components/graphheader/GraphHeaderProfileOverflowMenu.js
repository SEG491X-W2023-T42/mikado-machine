import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import * as React from "react";
import { useFirebase } from '../../../context/FirebaseContext';
import { getGatekeeperFlags } from "../../../graphlayer/store/Gatekeeper";

const allSettings = ['Profile', 'Account', 'Dashboard', 'Log out'];
const settingsImplementedRange = [3, 4];

export default function GraphHeaderProfileOverflowMenu() {
  const { hideUnimplementedProfileMenuItems } = getGatekeeperFlags();
  const [anchorUser, setAnchorUser] = React.useState(null);
  const { logOut, getGoogleDisplayName, getGoogleProfilePicture } = useFirebase();

  const displayName = getGoogleDisplayName();
  const profilePicture = getGoogleProfilePicture();

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

  let settings = allSettings;
  let settingsFunctions = [handleCloseUserMenu, handleCloseUserMenu, handleCloseUserMenu, handleSignOut];
  if (hideUnimplementedProfileMenuItems) {
    settings = settings.slice(...settingsImplementedRange);
    settingsFunctions = settingsFunctions.slice(...settingsImplementedRange);
  }

  return <Box sx={{ flexGrow: 0 }}>
    <Tooltip title="Open settings">
      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
        <Avatar alt={displayName} src={profilePicture} />
      </IconButton>
    </Tooltip>
    <Menu
      className="settings-menu"
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
          <Typography textAlign="center" sx={{fontSize: "11pt"}}>{setting}</Typography>
        </MenuItem>
      ))}
    </Menu>
  </Box>;
}
