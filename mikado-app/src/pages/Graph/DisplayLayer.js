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
import { notifyError } from "../../components/ToastManager";
import { StoreHackContext, useStoreHack } from "../../StoreHackContext.js";


/**
 * Remove the React Flow attribution temporarily so the demo looks cleaner.
 *
 * It should be readded if this project becomes commercialized.
 */
const proOptions = { hideAttribution: true };

// Not much point writing a proper selector if everything will be used
const selector = (state) => state;

const notifySaveError = notifyError.bind(null, "There was a problem saving your graph. Please check console for more details.");
const notifyExportError = notifyError.bind(null, "There was an error exporting the graph. Please try again.");

/**
 * @see DisplayLayer
 *
 * This is a separate component so that it can be wrapped in ReactFlowProvider for useReactFlow() to work.
 * That wrapper must not be in Plaza, because Plaza could have multiple React Flow graphs animating.
 */
function DisplayLayerInternal({ uid, setDisplayLayerHandle, graph }) {
  const reactFlowWrapper = useRef(void 0);
  const { nodes, edges, operations } = useStoreHack()(selector, shallow);
  const { project, fitView } = useReactFlow();
  const selectedNodeId = useRef(void 0);

  // Assert uid will never change
  // Changing layers should be done by replacing the DisplayLayer, which can be enforced by setting a React key prop on it
  // In general, DisplayLayer would be too complex to reason about if we allowed uid to change
  const [assertUid] = useState(uid);
  runtime_assert(assertUid === uid);

  function doSetDisplayLayerHandle() {
    setDisplayLayerHandle(new DisplayLayerHandle(operations, selectedNodeId.current, reactFlowWrapper, project));
  }
  // Load data from db
  useEffect(() => {
    operations.load(uid, graph.id, graph.subgraph)
    doSetDisplayLayerHandle();
  }, [uid, operations, graph]);

  const [testCount, setTestCount] = useState(0);
  useEffect(() => {
    console.log("displaylayer mount", testCount, "nodes", nodes, edges, operations);
    setTestCount(testCount + 1);
    return () => console.debug("displaylayer unmount");
  }, []);

  /*
  // Zoom on transition call
  useEffect(() => {
    if (graphTransition.transitionIn === true && graphTransition.transitionOut === false) {
      if (graphTransition.startFrom === "in") {
        fitView({ maxZoom: 9, duration: 800, nodes: [operations.getNode(graphTransition.nodeID)] })
      } else {
        fitView({ maxZoom: 9 })
        fitView({ duration: 800 })
      }

    } else if (graphTransition.transitionOut === true && graphTransition.transitionIn === false) {
      if (graphTransition.startFrom === "out") {
        fitView({ maxZoom: 1, duration: 800 })
      } else {
        fitView({ maxZoom: 1 })
        fitView({ duration: 800 });
      }
    }
  }, [graphTransition])
   */

  useOnSelectionChange({
    onChange({ nodes }) {
      selectedNodeId.current = nodes.length !== 1 ? void 0 : nodes[0].id;
      doSetDisplayLayerHandle();
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
      operations.connectOrDisconnect(target.id, id);
    }
  }
  console.debug("displaylayer graph", graph);

  // TODO move frame-motion animations except "zoom to focus node" to plaza so that it works properly
  // TODO look into what the fitView property actually does compared to the function and whether it works on reloading nodes
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
      fitView
    >
      <Background />
    </ReactFlow>
    <CustomControl onSaveClick={() => operations.save(uid, notifySaveError)} onExportClick={() => operations.export(fitView, notifyExportError)} />
  </main>;
}

/**
 * The DisplayLayer component shows ane layer of a Mikado that can be edited.
 *
 * A new DisplayLayer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */
function DisplayLayer({ uid, setDisplayLayerHandle, graph }) {
  const [useStore] = useState(() => useDisplayLayerStore());
  return (
    <ReactFlowProvider>
      <StoreHackContext.Provider value={useStore}>
        <DisplayLayerInternal uid={uid} setDisplayLayerHandle={setDisplayLayerHandle} graph={graph} />
      </StoreHackContext.Provider>
    </ReactFlowProvider>
  );
}

export default DisplayLayer;
