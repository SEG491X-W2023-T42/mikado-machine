import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    ReactFlowProvider,
    useOnSelectionChange,
    useReactFlow,
    useStoreApi as useReactFlowStoreApi
} from 'reactflow';
import { shallow } from "zustand/shallow";
import CustomControl from '../../graph/components/CustomControl.js';
import useGraphLayerViewerStore from "../store/GraphLayerViewerStore.js";
import { runtime_assert } from "../store/Assert.js";
import { DEFAULT_EDGE_OPTIONS, EDGE_TYPES, NODE_TYPES } from "../../pages/Graph/graphTheme.js";
import { MY_NODE_CONNECTION_MODE } from "../../graph/components/nodes/Node";
import createIntersectionDetectorFor from "../../helpers/CollisionDetection";
import { notifyError } from "../../graph/components/ToastManager.js";
import { StoreHackContext, useStoreHack } from "../../context/StoreHackContext.js";
import { EnterGraphHackContext } from "../../context/EnterGraphHackContext.js";
import AddNodeFab from '../../graph/components/overlays/AddNodeFAB.js';
import { getGatekeeperFlags } from "../store/Gatekeeper.js";
import QuestOverlay from '../../graph/components/overlays/QuestOverlay.js';


/**
 * Remove the React Flow attribution temporarily so the demo looks cleaner.
 *
 * It should be readded if this project becomes commercialized.
 */
const proOptions = { hideAttribution: true };

// Not much point writing a proper selector if everything will be used
const selector = (state) => state;

const notifySaveError = notifyError.bind(null, "There was a problem saving your graph. Please check console for more details.");

/**
 * @see GraphLayerViewer
 *
 * This is a separate component so that it can be wrapped in ReactFlowProvider for useReactFlow() to work.
 * That wrapper must not be in Plaza, because Plaza could have multiple React Flow graphs animating.
 */
function GraphLayerViewerInternal({ uid, graph }) {
  const { hideGraphControls, allowEditNodeLabel, allowAddNode } = getGatekeeperFlags();
  const reactFlowWrapper = useRef(void 0);
  const { nodes, edges, operations, editNode, editingNodeId } = useStoreHack()(selector, shallow);
  const { project, fitView } = useReactFlow();
  const selectedNodeId = useRef(void 0);
  const isTouchscreen = window.matchMedia("(pointer: coarse)").matches;
  const [currentTask, setCurrentTask] = useState();

  // Assert uid will never change
  // Changing layers should be done by replacing the GraphLayerViewer, which can be enforced by setting a React key prop on it
  // In general, GraphLayerViewer would be too complex to reason about if we allowed uid to change
  const [assertUid] = useState(uid);
  runtime_assert(assertUid === uid);

  // Load data from db
  useEffect(() => {
    operations.load(uid, graph.id, graph.subgraph)
  }, [uid, operations, graph]);

  const [testCount, setTestCount] = useState(0);
  useEffect(() => {
    console.log("GraphLayerViewer mount", testCount, "nodes", nodes, edges, operations);
    setTestCount(testCount + 1);

    return () => console.debug("GraphLayerViewer unmount");
  }, []);

  useEffect(() => {
	setCurrentTask(operations.getCurrentTasks())
  }, [operations.getCurrentTasks()])

  useEffect(() => {
	window.setInterval(function() {
		if (operations.getHasChanged()) {
			console.log("Saved changes!")
			operations.resetHasChanged()
			operations.save(uid, notifySaveError)
		}
	}, 15000)
  }, [])

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
    operations.highlightOrUnhighlightNode(null); //reset highlights
  }

  function onNodeDrag(_, node) { // continually check if nodes are intersecting and highlight them to show impending connection
    const target = nodes.find(createIntersectionDetectorFor(node));
    if(target) {
      operations.highlightOrUnhighlightNode(target);
    } else {
      operations.highlightOrUnhighlightNode(null);
    }
  }

  function addNode(paneClickOrUndef) {
    if (!allowAddNode) return;
    const elem = reactFlowWrapper.current;
    runtime_assert(elem);
    const { x, y, width, height } = elem.getBoundingClientRect();

    // Adds node if on background pane
    let position = {
      x: width / 2,
      y: height / 2,
    };
    if (paneClickOrUndef) {
      // Background double clicks only
      if (paneClickOrUndef.target.tagName !== "DIV" || !paneClickOrUndef.target.className.includes("react-flow__pane")) return;
      position = {
        x: paneClickOrUndef.clientX - x,
        y: paneClickOrUndef.clientY - y,
      };
    }
    position = project(position);
    operations.addNode(position) || notifyError("No space for new node! Please try adding elsewhere.");
  }

  function startEditingNode(id, isBackspace) {
    if (!allowEditNodeLabel) return;
    const defaultText = isBackspace ? "" : operations.getNodeLabel(id);
    editNode(id, defaultText);
  }

  function onNodeStartEditingEventListener(e, node) {
    if (!allowEditNodeLabel) return;
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

  console.debug("GraphLayerViewer graph", graph);

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
      panOnScroll={true}
      proOptions={proOptions}
      defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      connectionMode={MY_NODE_CONNECTION_MODE}
      onNodeContextMenu={onNodeStartEditingEventListener}
      onNodeDoubleClick={onNodeStartEditingEventListener}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeDrag={onNodeDrag}
      zoomOnDoubleClick={false}
      onDoubleClick={isTouchscreen ? void 0 : addNode}
      fitView
    >

      {/* { !isTouchscreen && <QuestOverlay currentTask={currentTask} completeClick={() => operations.completeCurrentTask()}/> } */}
      { false && <QuestOverlay currentTask={currentTask} completeClick={() => operations.completeCurrentTask()}/> }
      <Background />

    </ReactFlow>
    {!hideGraphControls && <CustomControl onSaveClick={() => operations.save(uid, notifySaveError)} onExportClick={() => {
      fitView();
      operations.export(reactFlowWrapper.current.querySelector("svg.react-flow__edges"));
    }} />}
    { allowAddNode && isTouchscreen && <AddNodeFab onClick={() => void addNode()} /> }

  </main>;
}

/**
 * The GraphLayerViewer component shows ane layer of a Mikado that can be edited.
 *
 * A new GraphLayerViewer is created and replaces the current one when entering/exiting a subtree.
 * The Plaza survives on the other hand such an action and contains long-living UI controls.
 */
function GraphLayerViewer({ uid, graph, enterGraph }) {
  const [useStore] = useState(() => useGraphLayerViewerStore());
  return (
    <ReactFlowProvider>
      <StoreHackContext.Provider value={useStore}>
        <EnterGraphHackContext.Provider value={enterGraph}>
          <GraphLayerViewerInternal uid={uid} graph={graph} />
        </EnterGraphHackContext.Provider>
      </StoreHackContext.Provider>
    </ReactFlowProvider>
  );
}

export default GraphLayerViewer;
