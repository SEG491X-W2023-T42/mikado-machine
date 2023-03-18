import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useOnSelectionChange, useReactFlow } from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../components/CustomControl/CustomControl';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import { runtime_assert } from "../../viewmodel/assert";
import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "./graphTheme";
import { MY_NODE_CONNECTION_MODE } from "./MyNode";
import DisplayLayerHandle from "./DisplayLayerHandle";
import createIntersectionDetectorFor from "../../viewmodel/aabb";
import Overlay from "../../components/Overlays/Overlay"
import { motion } from "framer-motion"


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
function DisplayLayerInternal({ uid, notifySuccessElseError, fabNotifySuccessElseError, exportNotifySuccessElseError, setDisplayLayerHandle, graphName, animation, graphTransition}) {
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
    operations.load(uid, graphName);
  }, [operations.load, uid, operations, graphName]);
  // Workaround to run fitView on the next render after the store is updated
  useEffect(() => {
    // Yield the event loop so that React Flow can receive the nodes before telling it to fit them.
    setDisplayLayerHandle(new DisplayLayerHandle(operations, nodes.length !== 1 ? void 0 : nodes[0].id));
  }, [loadAutoincremented]);

  // Zoom on transition call
  useEffect(() => {
    if (graphTransition.transitionIn === true && graphTransition.transitionOut === false) {
      if (graphTransition.startFrom === "in") {
        fitView({maxZoom: 9, duration: 800, nodes: [operations.getNode(graphTransition.nodeID)]})
      } else {
        fitView({duration: 800})
      }
      
    } else if (graphTransition.transitionOut === true && graphTransition.transitionIn === false) {
      if (graphTransition.startFrom === "out") {
        fitView({maxZoom: 1, duration: 800})
      } else {
        fitView({duration: 800});
      }
    }
  }, [graphTransition])

  
  useOnSelectionChange({
    onChange({ nodes }) {
      setDisplayLayerHandle(new DisplayLayerHandle(operations, nodes.length !== 1 ? void 0 : nodes[0].id));
    }
  });

  function onNodeDragStart(_, node) {
    operations.markNodePosition(node.id);
  }

  function onNodeDragStop(_, node) {
    const target = nodes.find(createIntersectionDetectorFor(node));
    if (target) {
      const { id } = node;
      operations.restoreNodePosition(id);
      operations.connectOrDisconnect(id, target.id);
    }
  }

  function addNode() {

    // Looks for top left of viewport
    const position = project({
      x: document.documentElement.clientWidth / 16,
      y: document.documentElement.clientHeight / 16,
    });

    const viewport = project({
      x: document.documentElement.clientWidth,
      y: document.documentElement.clientHeight,
    })

    fabNotifySuccessElseError(operations.addNode(position, viewport));
  }
  return <main ref={reactFlowWrapper}>
    <motion.div 
      style={{display: "inline"}}
      animate={animation.animate}
      transition={animation.transition}
    >
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
        fitView
      >
        <Background />
      </ReactFlow>
    </motion.div>
    <CustomControl onSaveClick={() => operations.save(uid, notifySuccessElseError)} onExportClick={() => operations.export(fitView, exportNotifySuccessElseError)} />
    <Overlay FABonClick={addNode}/>
    
  </main>;
}

/**
 * The DisplayLayer component shows ane layer of a Mikado that can be edited.
 *
 * A new DisplayLayer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */


function DisplayLayer({ uid, notifySuccessElseError, fabNotifySuccessElseError, exportNotifySuccessElseError, setDisplayLayerHandle, graphName, animation, graphTransition }) {
  return (
    <ReactFlowProvider>
      <DisplayLayerInternal uid={uid} notifySuccessElseError={notifySuccessElseError} fabNotifySuccessElseError={fabNotifySuccessElseError} exportNotifySuccessElseError={exportNotifySuccessElseError} setDisplayLayerHandle={setDisplayLayerHandle} graphName={graphName} animation={animation} graphTransition={graphTransition}/>
    </ReactFlowProvider>
  );
}
export default DisplayLayer;
