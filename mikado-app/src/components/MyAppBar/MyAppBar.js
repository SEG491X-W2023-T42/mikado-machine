import "./MyAppBar.css";
import * as React from 'react';
import { AppBar, Button, Container, Toolbar } from '@mui/material'
import AppBarProfileOverflowMenu from "./AppBarProfileOverflowMenu";
import SeamlessEditor from "../SeamlessEditor";
import { useState } from "react";

export default function MyAppBar({ graph, graphHandle }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  function startEditingTitle() {
    setIsEditingTitle(true);
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
            label={graph.id}
            editing={isEditingTitle}
            initialValue={graph.id}
            onFinishEditing={(filteredText) => {
              void filteredText; // TODO
              setIsEditingTitle(false);
            }}
            singleLine={true}
          />
          {(graph.subgraph !== "") &&
          <Button sx={{color: "white"}} onClick={() => {graphHandle({id: graph.id, subgraph: ""})}}>
            Back
          </Button>}
          <AppBarProfileOverflowMenu></AppBarProfileOverflowMenu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
