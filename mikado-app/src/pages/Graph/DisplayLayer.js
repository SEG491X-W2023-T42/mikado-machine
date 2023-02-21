/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import { useEffect } from 'react';
import ReactFlow, { Background, } from 'reactflow';
import { shallow } from "zustand/shallow";

import CustomControl from '../../components/CustomControl/CustomControl';

import 'reactflow/dist/style.css';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";

// Not much point writing a proper selector if everything will be used
const selector = (state) => state;

/**
 * The DisplayLayer component shows ane layer of a Mikado that can be edited.
 *
 * A new DisplayLayer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */
function DisplayLayer({ uid, notifySuccessElseError }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, load, save } = useDisplayLayerStore(selector, shallow);

  // Load data from db
  useEffect(() => {
    load(uid);
  }, []);

  return (
    <main>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <CustomControl onClick={() => save(uid, notifySuccessElseError)} />

        <Background />
      </ReactFlow>
    </main>
  );
}

export default DisplayLayer;
