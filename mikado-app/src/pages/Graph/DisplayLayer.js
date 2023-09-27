import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, { Background, ReactFlowProvider, useOnSelectionChange, useReactFlow, useStoreApi as useReactFlowStoreApi } from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../components/CustomControl/CustomControl';
import useDisplayLayerStore from "../../viewmodel/displayLayerStore";
import { runtime_assert } from "../../viewmodel/assert";
import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "./graphTheme";
import { MY_NODE_CONNECTION_MODE } from "./MyNode";
import createIntersectionDetectorFor from "../../viewmodel/aabb";
import { notifyError } from "../../components/ToastManager";
import { StoreHackContext, useStoreHack } from "../../StoreHackContext.js";
import { dimensions } from '../../helpers/NodeConstants';
import { EnterGraphHackContext } from "./EnterGraphHackContext";


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
function DisplayLayerInternal({ uid, graph }) {
  const reactFlowWrapper = useRef(void 0);
  const { nodes, edges, operations, editNode, editingNodeId } = useStoreHack()(selector, shallow);
  const { project, fitView } = useReactFlow();
  const selectedNodeId = useRef(void 0);

  // Assert uid will never change
  // Changing layers should be done by replacing the DisplayLayer, which can be enforced by setting a React key prop on it
  // In general, DisplayLayer would be too complex to reason about if we allowed uid to change
  const [assertUid] = useState(uid);
  runtime_assert(assertUid === uid);

  // Load data from db
  useEffect(() => {
    operations.load(uid, graph.id, graph.subgraph)
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

  function onDoubleClick(e) {

    // Adds node if on background pane
    if ('DIV' === e.target.tagName) {
        // Background double click
        if (e.target.className.includes('react-flow__pane')) {
            const elem = reactFlowWrapper.current;
            if (!elem) {
                return;
            }

            const position = project({
                x: e.clientX,
                y: e.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
            });

            // Adjusting so that the node is in center of mouse
            position.x = position.x - dimensions.width / 2
            position.y = position.y - dimensions.height / 2

            const viewport = project({
                x: elem.clientWidth,
                y: elem.clientHeight,
            });

            operations.addNode(position, viewport) || notifyError("No space for new node! Please try adding elsewhere.");
        }
    }


  }

  function startEditingNode(id, isBackspace) {
    // TODO replace with text field
    const defaultText = isBackspace ? "" : operations.getNodeLabel(id);
    editNode(id, defaultText);
  }

  // TODO verify onNodeContextMenu works on iOS
  function onNodeStartEditingEventListener(e, node) {
    e.preventDefault();
    startEditingNode(node.id, false);
  }

  useEffect(() => {
    function pressListener() {
      if ("maxLength" in document.activeElement) return; // Ignore when already in text field
      // Not bothering to try adding the key to the text field, whether appending or replacing
      // That would break accessibility, keyboard layouts, and IMEs
      selectedNodeId.current && startEditingNode(selectedNodeId.current, false);
    }
    function backspaceListener(e) {
      if (e.key !== "Backspace") return;
      if ("maxLength" in document.activeElement) return; // Ignore when already in text field
      selectedNodeId.current && startEditingNode(selectedNodeId.current, true);
    }
    // keypress is deprecated but it is used to filter out CTRL, ALT, etc.
    document.addEventListener('keypress', pressListener);
    document.addEventListener('keyup', backspaceListener);
    return () => {
      document.removeEventListener('keypress', pressListener);
      document.removeEventListener('keyup', backspaceListener);
    }
  }, []);

  const reactFlowStore = useReactFlowStoreApi();
  useEffect(() => {
    // TODO upstream to react flow
    const { d3Selection } = reactFlowStore.getState();
    d3Selection.on('dblclick.zoom', null);
  }, []);

  console.debug("displaylayer graph", graph);

  // TODO move frame-motion animations except "zoom to focus node" to plaza so that it works properly
  // TODO look into what the fitView property actually does compared to the function and whether it works on reloading nodes
  return <main ref={reactFlowWrapper}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={operations.onNodesChange}
      nodesConnectable={false}
      nodesDraggable={!editingNodeId}
      panOnDrag={!editingNodeId}
      proOptions={proOptions}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      connectionMode={MY_NODE_CONNECTION_MODE}
      onNodeContextMenu={onNodeStartEditingEventListener}
      onNodeDoubleClick={onNodeStartEditingEventListener}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      zoomOnDoubleClick={false}
      onDoubleClick={onDoubleClick}
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
function DisplayLayer({ uid, graph, enterGraph }) {
  const [useStore] = useState(() => useDisplayLayerStore());
  return (
    <ReactFlowProvider>
      <StoreHackContext.Provider value={useStore}>
        <EnterGraphHackContext.Provider value={enterGraph}>
          <DisplayLayerInternal uid={uid} graph={graph} />
        </EnterGraphHackContext.Provider>
      </StoreHackContext.Provider>
    </ReactFlowProvider>
  );
}

export default DisplayLayer;
