import "./GraphHeader.css";
import * as React from 'react';
import { AppBar, Container, Toolbar, Popover, Typography, IconButton, Tooltip } from '@mui/material'
import GraphHeaderProfileOverflowMenu from "./GraphHeaderProfileOverflowMenu";
import SeamlessEditor from "../../../graph/components/SeamlessEditor";
import { useEffect, useState } from "react";
import { db, getGatekeeperFlags } from "../../../graphlayer/store/Gatekeeper";
import { doc, getDoc, setDoc } from "firebase/firestore";
import  HelpIcon from '@mui/icons-material/Help';
import { Menu } from "@mui/icons-material";

function serializeGraphWithTitle(title) {
  return {
    name: title,
    version: 0,
    // "root" and "sublayers" properties will be implemented once the db migration actually starts
  }
}

export default function GraphHeader({ uid, graph: { id }, setNavOpen }) {
  const { allowEditGraphName, hideProfileMenu } = getGatekeeperFlags();
  const [savedTitle, setSavedTitle] = useState(null);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    // TODO move this to a separate provider
    setSavedTitle(null);
    setTitle("Loading...");
    setIsEditingTitle(false);
    let cancelled = false;
    (async function()  {
      const docSnap = await getDoc(doc(db, "user", uid, "graphs", id));
      if (!docSnap.exists()) {
        return id;
      }
      const { name } = docSnap.data();
      return name;
    })().then(newTitle => {
      if (!cancelled) {
        setTitle(newTitle);
        setSavedTitle(newTitle);
      }
    });
    // TODO catch
    return () => void (cancelled = true);
  }, [id]);

  useEffect(() => {
    if (savedTitle === null || title === savedTitle) return;
    let cancelled = false;
    setDoc(doc(db, "user", uid, "graphs", id), serializeGraphWithTitle(title)).then(() => {
      if (!cancelled) {
        setSavedTitle(title);
      }
    });
    // TODO catch
    return () => void (cancelled = true);
  }, [title, savedTitle]);


  function startEditingTitle(e) {
    if (!allowEditGraphName || title !== savedTitle || isEditingTitle) return;
    e.preventDefault();
    setIsEditingTitle(true);
    // Not including key handlers because no other app starts editing titles that way
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <AppBar position="static">
      <Container maxWidth="x2">
        <Toolbar
          disableGutters
          onDoubleClick={startEditingTitle}
          onContextMenu={startEditingTitle}
        >
			<IconButton 
				color="inherit"
				size="large"
				onClick={() => setNavOpen(true)}
			>
				<Menu fontSize="inherit" />
			</IconButton>
          <SeamlessEditor
            label={title}
            editing={isEditingTitle}
            initialValue={title}
            onFinishEditing={(filteredText) => {
              if (title !== savedTitle) return;
              setIsEditingTitle(false);
              setTitle(filteredText);
            }}
            singleLine={true}
          />
          <Tooltip title="Help & controls">
            <IconButton
              abel="Help"
              aria-label="Help"
              sx={{ mr: 2, color: 'white', size: 'medium' }}

              onClick={handleClick}
            >
              <HelpIcon sx={{fontSize: '28px'}}/>
            </IconButton>
          </Tooltip>
          <Popover
            className="help-popover"
            id={open ? 'help-popover' : undefined}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}

            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Typography textAlign={"left"} sx={{ px: 2, py: 1, fontSize:"10pt" }}>
              {/* <span style={{fontSize: "11pt", pb: 4}}> Welcome to MyMikado! </span>  */}
              <h2>Welcome to MyMikado!</h2>
              <p>
                MyMikado is a graph editor for managing goals and tasks in a tree format with the <a href="https://mikadomethod.info/" target="new">Mikado Method</a>.
              </p>
              <p>
                The Mikado Method is a process developed by <b>Ola Ellnestam</b> and <b>Daniel Brolund</b> for managing large-scale critical changes to existing software projects. 
                You can read more about it in their book of the same name, available <a href="https://www.manning.com/books/the-mikado-method" target="new">here</a>.
              </p>
              <h3>Controls</h3>
              <p>
                <li>Double-click a blank space to create a new node.</li>
                <li>Drag and drop a node onto another node to connect it as a dependent task.</li>
                <li>To disconnect two nodes, drag and drop either node onto the other one.</li>
                <li>Double click the text on a node to edit it.</li>
                <li>Click a node and use the context menu for additional actions.</li>
              </p>
              <h3>Need more help?</h3>
              <p>
                You can find our team&apos;s contact information on this project&apos;s <a href="https://github.com/SEG491X-W2023-T42/mikado-machine" target="new">GitHub repository</a>, and you can create an issue there if you have a problem to report.
              </p>
            </Typography>
          </Popover>
          {!hideProfileMenu && <GraphHeaderProfileOverflowMenu />}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
