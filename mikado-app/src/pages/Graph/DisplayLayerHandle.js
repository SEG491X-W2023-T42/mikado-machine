import { notifyError } from "../../components/ToastManager";

const notifyAddError = notifyError.bind(null, "No space for new node! Please zoom out and try again.");

/**
 * Callback object for things like floating controls to interact with the viewmodel
 */
export default class DisplayLayerHandle {
  /**
   * The underlying DisplayLayerOperations.
   * This is set to private to encapsulate the DisplayLayerOperations from the rest of the objects
   */
  #displayLayerOperations;

  /**
   * The id of the node selected in the graph
   */
  #selectedNodeId;

  /**
   * A ref to the Element containing the rendered React Flow graph
   */
  #viewportRef;

  /**
   * A function to convert screen coordinates into viewmodel coordinates
   */
  #projectFunction;

  /**
   * This object is to be recreated when anything relevant in the DisplayLayer changes.
   * It can be set to undefined when the DisplayLayer is gone during transitions.
   */
  constructor(
    displayLayerOperations = void 0,
    selectedNodeId = void 0,
    viewportRef = { current: void 0 },
    projectFunction = () => ({ x: 0, y: 0 }),
  ) {
    this.#displayLayerOperations = displayLayerOperations;
    this.#selectedNodeId = selectedNodeId;
    this.#viewportRef = viewportRef;
    this.#projectFunction = projectFunction;
  }

  /**
   * Returns the display name of the selected node
   */
  getSelectedNodeName() {
    const id = this.#selectedNodeId;
    return id && this.#displayLayerOperations?.getNodeLabel(id);
  }

  /**
   * Sets the display name of the selected node
   */
  setSelectedNodeName(name) {
    const id = this.#selectedNodeId;
    id && this.#displayLayerOperations?.setNodeLabel(id, name);
  }


  /**
   * Zooms into current selected node as a transition for subgraphing
   */
  getSelectedNodePos() {
    return typeof this.#selectedNodeId !== "undefined" ? this.#displayLayerOperations?.getNodeAbsolutePos(this.#selectedNodeId) : { x: 0, y: 0 };
  }

  /**
   * Returns the selected node id
   */
  getSelectedNodeID() {
    return this.#selectedNodeId
  }

  /**
   * Returns the current graph name
   */
  getCurrentGraph() {
    return this.#displayLayerOperations?.getGraphName();
  }

  /**
   * Returns true if node has subgraph
   */
  isSubgraphNode() {
    return this.#displayLayerOperations?.isNodeSubgraph(this.#selectedNodeId)
  }

  /**
   * Gets current node type
   */
  isNotGoalNode() {
    if (this.#selectedNodeId !== undefined) {
      return this.#displayLayerOperations?.getNodeType(this.#selectedNodeId) !== "goal"
    } else {
      return false
    }

  }

  /**
   * Adds a node
   */
  addNode() {
    // Looks for top left of viewport
    const elem = this.#viewportRef.current;
    if (!elem) {
      return;
    }
    const measured = {
      x: elem.clientWidth,
      y: elem.clientHeight,
    };
    const position = this.#projectFunction({
      x: measured.x / 16,
      y: measured.y / 16,
    });
    const viewport = this.#projectFunction(measured);
    this.#displayLayerOperations.addNode(position, viewport) || notifyAddError();
  }

  /**
   * Exports to file
   */
  export() {
    this.#displayLayerOperations?.export();
  }

  prepareCreateSubgraphAndSaveIfNotExists() {
    const id = this.#selectedNodeId;
    return (uid) => id && this.#displayLayerOperations?.createSubgraphAndSaveIfNotExists(uid, id);
  }
}
