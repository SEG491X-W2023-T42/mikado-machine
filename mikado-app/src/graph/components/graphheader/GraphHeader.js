import "./GraphHeader.css";
import * as React from 'react';
import { AppBar, Button, Container, Toolbar } from '@mui/material'
import GraphHeaderProfileOverflowMenu from "./GraphHeaderProfileOverflowMenu";
import SeamlessEditor from "../../../graph/components/SeamlessEditor";
import { useEffect, useState } from "react";
import { db, getGatekeeperFlags } from "../../../graphlayer/store/Gatekeeper";
import { doc, getDoc, setDoc } from "firebase/firestore";

function serializeGraphWithTitle(title) {
  return {
    name: title,
    version: 0,
    // "root" and "sublayers" properties will be implemented once the db migration actually starts
  }
}

export default function GraphHeader({ uid, graph: { id, subgraph }, graphHandle }) {
  const { allowEditGraphName, hideProfileMenu } = getGatekeeperFlags();
  const [savedTitle, setSavedTitle] = useState(null);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
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
  return (
    <AppBar position="static">
      <Container maxWidth="x2">
        <Toolbar
          disableGutters
          onDoubleClick={startEditingTitle}
          onContextMenu={startEditingTitle}
        >
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
          {(subgraph !== "") &&
          <Button sx={{color: "white"}} onClick={() => {graphHandle({id, subgraph: ""})}}>
            Back
          </Button>}
          {!hideProfileMenu && <GraphHeaderProfileOverflowMenu />}
        </Toolbar>
      </Container>
    </AppBar>
  );
}