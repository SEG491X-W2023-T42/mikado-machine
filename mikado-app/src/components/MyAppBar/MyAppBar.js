import * as React from 'react';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import AppBarProfileOverflowMenu from "./AppBarProfileOverflowMenu";

export default function MyAppBar({ graph, graphHandle }) {
  return (
    <AppBar position="static">
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
                // Placeholder for now, TODO replace with name
              }
              {graph.id}
            </Typography>

          </Box>
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
