import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip, Typography, Switch, FormControlLabel } from "@mui/material";
import * as React from "react";
import { useFirebase } from '../../../context/FirebaseContext';
import { getGatekeeperFlags } from "../../../graphlayer/store/Gatekeeper";

const allSettings = ['Profile', 'Account', 'Dashboard', 'Log out'];
const settingsImplementedRange = [3, 4];

export default function GraphHeaderProfileOverflowMenu({ questlineEnabled, setQuestlineEnabled }) {
  const { hideUnimplementedProfileMenuItems } = getGatekeeperFlags();
  const [anchorUser, setAnchorUser] = React.useState(null);
  const { logOut, getGoogleDisplayName, getGoogleProfilePicture } = useFirebase();

  const displayName = getGoogleDisplayName();
  const profilePicture = getGoogleProfilePicture();

  const handleSwitchChange = (event) => {
	setQuestlineEnabled(event.target.checked);
  }

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
		<MenuItem>
			<FormControlLabel 
				sx={{margin: 0, padding: 0}}
				labelPlacement="start" 
				control={
					<Switch
            size="small"
						checked={questlineEnabled}
						onChange={handleSwitchChange}
            sx={{marginLeft: "32px", alignSelf: "right"}}
					/>
				} 
				label={<Typography sx={{fontSize: "12pt", fontFamily: "Inter"}}>Quests</Typography>}
			/>
		</MenuItem>
      {settings.map((setting, index) => (
        <MenuItem key={setting} onClick={settingsFunctions[index]}>
			<Typography textAlign="center" sx={{fontSize: "11pt", fontFamily: "Inter"}}>{setting}</Typography>
        </MenuItem>
      ))}
    </Menu>
  </Box>;
}
