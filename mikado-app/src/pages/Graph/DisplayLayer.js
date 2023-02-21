import * as React from 'react';
import { useEffect, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useReactFlow, } from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../components/CustomControl/CustomControl';
import 'reactflow/dist/style.css';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import { runtime_assert } from "../../viewmodel/assert";
import { DEFAULT_EDGE_OPTIONS } from "./graphTheme";

/**
 * Remove the React Flow attribution temporarily so the demo looks cleaner.
 *
 * It should be readded if this project becomes commercialized.
 */
const proOptions = { hideAttribution: true };

// Not much point writing a proper selector if everything will be used
const selector = (state) => state;

/**
 * @see DisplayLayer
 *
 * This is a separate component so that it can be wrapped in ReactFlowProvider for useReactFlow() to work.
 * That wrapper must not be in Plaza, because Plaza could have multiple React Flow graphs animating.
 */
function DisplayLayerInternal({ uid, notifySuccessElseError }) {
  const { nodes, edges, loadAutoincremented, onNodesChange, onEdgesChange, onConnect, load, save } = useDisplayLayerStore(selector, shallow);
  const { fitView } = useReactFlow();

  // Assert uid will never change
  // Changing layers should be done by replacing the DisplayLayer, which can be enforced by setting a React key prop on it
  // In general, DisplayLayer would be too complex to reason about if we allowed uid to change
  const [assertUid] = useState(uid);
  runtime_assert(assertUid === uid);

  // Load data from db
  useEffect(() => {
    load(uid);
  }, [load, uid]);
  // Workaround to run fitView on the next render after the store is updated
  useEffect(() => {
    fitView();
  }, [fitView, loadAutoincremented]);

  return <main>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      proOptions={proOptions}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
    >
      <CustomControl onClick={() => save(uid, notifySuccessElseError)} />
      <Background />
    </ReactFlow>
  </main>;
}

/**
 * The DisplayLayer component shows ane layer of a Mikado that can be edited.
 *
 * A new DisplayLayer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */
function DisplayLayer({ uid, notifySuccessElseError }) {
  return <ReactFlowProvider>
    <DisplayLayerInternal uid={uid} notifySuccessElseError={notifySuccessElseError} />
  </ReactFlowProvider>;
}

export default DisplayLayer;
