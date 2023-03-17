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
   * This object is to be recreated when anything relevant in the DisplayLayer changes.
   * It can be set to undefined when the DisplayLayer is gone during transitions.
   */
  constructor(displayLayerOperations = void 0, selectedNodeId = void 0) {
    this.#displayLayerOperations = displayLayerOperations;
    this.#selectedNodeId = selectedNodeId;
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
  zoomInto() {
    
  }

  /**
   * Returns the current graph name
   */
  getCurrentGraph() {
    return this.#displayLayerOperations?.getGraphName();
  }

  /**
   * Adds a node
   */
  addNode() {
    // TODO Pass the viewport center to the class constructor so it can be used here
    this.#displayLayerOperations?.addNode({x: 0, y: 0});
  }

  /**
   * Exports as pdf
   */
  export() {
    this.#displayLayerOperations?.export();
  }

}
