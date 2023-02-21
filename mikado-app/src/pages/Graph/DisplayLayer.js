import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useOnSelectionChange, useReactFlow, } from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../components/CustomControl/CustomControl';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import { runtime_assert } from "../../viewmodel/assert";
import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "./graphTheme";
import { MY_NODE_CONNECTION_MODE } from "./MyNode";

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
function DisplayLayerInternal({ uid, notifySuccessElseError, setSelectionData }) {
  const {
    nodes, edges, loadAutoincremented, operations: {
      onNodesChange, load, save, markNodePosition, restoreNodePosition, connectOrDisconnect, renameNode,
    }
  } = useDisplayLayerStore(selector, shallow);
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
    // Yield the event loop so that React Flow can receive the nodes before telling it to fit them.
    const id = setTimeout(() => fitView(), 0);
    return () => clearTimeout(id);
  }, [fitView, loadAutoincremented]);

  useOnSelectionChange({
    onChange({ nodes }) {
      if (nodes.length !== 1) {
        setSelectionData(void 0);
        return;
      }
      const { id, data: { label: name } } = nodes[0];
      setSelectionData({
        name,
        setName(name) {
          renameNode(id, name);
        },
      })
    }
  });

  function onNodeDragStart(_, node) {
    markNodePosition(node.id);
  }

  function onNodeDragStop(_, node) {
    const { id, position: { x: l, y: t } } = node;
    const r = l + node.width, b = t + node.height;
    const target = nodes.find(other => {
      const { x: oL, y: oT } = other.position;
      const oR = oL + other.width, oB = oT + other.height;
      return !(other.id === id || r < oL || l > oR || t > oB || b < oT);
    });
    if (target) {
      restoreNodePosition(id);
      connectOrDisconnect(id, target.id);
    }
  }

  return <main>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      nodesConnectable={false}
      proOptions={proOptions}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      connectionMode={MY_NODE_CONNECTION_MODE}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
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
function DisplayLayer({ uid, notifySuccessElseError, setSelectionData }) {
  return <ReactFlowProvider>
    <DisplayLayerInternal uid={uid} notifySuccessElseError={notifySuccessElseError} setSelectionData={setSelectionData} />
  </ReactFlowProvider>;
}

export default DisplayLayer;
