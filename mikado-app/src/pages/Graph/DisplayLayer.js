import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useOnSelectionChange, useReactFlow, } from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../components/CustomControl/CustomControl';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import { runtime_assert } from "../../viewmodel/assert";
import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "./graphTheme";
import { MY_NODE_CONNECTION_MODE } from "./MyNode";
import { DRAG_AND_DROP_EFFECT, DRAG_AND_DROP_MAGIC, DRAG_AND_DROP_MIME } from "./MyDrawer";
import DisplayLayerHandle from "./DisplayLayerHandle";

/**
 * Remove the React Flow attribution temporarily so the demo looks cleaner.
 *
 * It should be readded if this project becomes commercialized.
 */
const proOptions = { hideAttribution: true };

// Not much point writing a proper selector if everything will be used
const selector = (state) => state;

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = DRAG_AND_DROP_EFFECT;
}

/**
 * @see DisplayLayer
 *
 * This is a separate component so that it can be wrapped in ReactFlowProvider for useReactFlow() to work.
 * That wrapper must not be in Plaza, because Plaza could have multiple React Flow graphs animating.
 */
function DisplayLayerInternal({ uid, notifySuccessElseError, setDisplayLayerHandle }) {
  const reactFlowWrapper = useRef(void 0);
  const { nodes, edges, loadAutoincremented, operations } = useDisplayLayerStore(selector, shallow);
  const { project, fitView } = useReactFlow();

  // Assert uid will never change
  // Changing layers should be done by replacing the DisplayLayer, which can be enforced by setting a React key prop on it
  // In general, DisplayLayer would be too complex to reason about if we allowed uid to change
  const [assertUid] = useState(uid);
  runtime_assert(assertUid === uid);

  // Load data from db
  useEffect(() => {
    operations.load(uid);
  }, [operations.load, uid]);
  // Workaround to run fitView on the next render after the store is updated
  useEffect(() => {
    // Yield the event loop so that React Flow can receive the nodes before telling it to fit them.
    const id = setTimeout(() => fitView(), 0);
    return () => clearTimeout(id);
  }, [fitView, loadAutoincremented]);

  useOnSelectionChange({
    onChange({ nodes }) {
      setDisplayLayerHandle(new DisplayLayerHandle(operations, nodes.length !== 1 ? void 0 : nodes[0].id));
    }
  });

  function onNodeDragStart(_, node) {
    operations.markNodePosition(node.id);
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
      operations.restoreNodePosition(id);
      operations.connectOrDisconnect(id, target.id);
    }
  }

  function onDrop(event) {
    event.preventDefault();

    // check if the dropped element is valid
    if (event.dataTransfer.getData(DRAG_AND_DROP_MIME) !== DRAG_AND_DROP_MAGIC) {
      return;
    }

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    operations.addNode(position);
  }

  return <main ref={reactFlowWrapper}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={operations.onNodesChange}
      nodesConnectable={false}
      proOptions={proOptions}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      connectionMode={MY_NODE_CONNECTION_MODE}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CustomControl onClick={() => operations.save(uid, notifySuccessElseError)} />
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
function DisplayLayer({ uid, notifySuccessElseError, setDisplayLayerHandle }) {
  return <ReactFlowProvider>
    <DisplayLayerInternal uid={uid} notifySuccessElseError={notifySuccessElseError} setDisplayLayerHandle={setDisplayLayerHandle} />
  </ReactFlowProvider>;
}

export default DisplayLayer;
