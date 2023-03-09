import { create } from "zustand";
import { loadFromDb, saveToDb } from "./serde";
import generateAutoincremented from "./autoincrement";
import { createEdgeObject, createNodeObject } from "./displayObjectFactory";

/**
 * Subset of React Flow's onNodesChange.
 * This is to filter the changes so that of the user's requested changes,
 * only changes we can handle are realized.
 */
function myOnNodesChange(changes, nodes, set) {
  const changesById = {};
  let affected = false;
  for (const change of changes) {
    const { id, type } = change;
    // Ignore add, remove, reset. Those changes should be done through this viewmodel
    switch (type) {
      case "select":
      case "position":
      case "dimensions":
        break;
      default:
        continue;
    }
    affected = true;
    (changesById[id] = changesById[id] || []).push(change);
  }
  if (!affected) return;
  set({
    nodes: nodes.map(node => {
      const myChanges = changesById[node.id];
      if (!myChanges) return node;
      node = { ...node };
      for (const change of myChanges) {
        switch (change.type) {
          case "select":
            node.selected = change.selected;
            break;
          case "position": {
            const { position, dragging } = change;
            position && (node.position = position);
            node.dragging = dragging ?? node.dragging;
            // Ignoring positionAbsolute and expandParent as the DB can't persist them
            break;
          }
          case "dimensions": {
            // Store dimensions so that other places can use it
            // This is calculated on start, and not directly changed by the user
            const { dimensions } = change;
            if (dimensions) {
              node.width = dimensions.width;
              node.height = dimensions.height;
            }
            // Ignore styling and resizing as they are not used
            break;
          }
          default:
            break;
        }
      }
      return node;
    }),
  });
}

function arrayRemoveByValueIfPresent(array, value) {
  const i = array.indexOf(value);
  if (i >= 0) {
    array.splice(i, 1);
  }
}

/**
 * Separate object for functions and cache for the viewmodel.
 *
 * Its fields are modified directly to avoid getting in the way of the shallow comparison.
 * It is also here to skip shallow compare of all those methods.
 */
class DisplayLayerOperations {
  /*
   * DisplayLayer cache data.
   * This data contains caches so that computations can be efficiently performed before
   * passing them to the View (React Flow).
   */

  /**
   * A loading indicator.
   *
   * React sometimes likes to run useEffect twice, so this variable must be assigned directly and immediately.
   * This also helps with preventing other race conditions.
   */
  #loading = false;

  /**
   * The forwards connection map of arrays of IDs.
   *
   * This duplicates the edges data, but is in a format easier to manipulate. It will also be the version
   * stored in the database. The forward connections are used for depth-first search and updating
   * node completion.
   *
   * These arrays are not sorted. On one hand this allows fast insertion. On the other hand query is O(n).
   * But in practice linear scans are quite fast or even faster due to CPU caching / branch prediction.
   */
  #forwardConnections = {};

  /**
   * Similar to forwardConnections.
   *
   * Used mainly for deletion.
   */
  #backwardConnections = {};

  /**
   * A scratch area for depth-first search.
   */
  #depthFirstSearch = {};

  // Zustand data

  /**
   * Sets the Zustand store state
   */
  #set;

  /**
   * Gets the Zustand store state
   */
  #get;

  /**
   * Cached state after getting
   */
  #state;

  constructor(set, get) {
    this.#set = set;
    this.#state = (this.#get = get)();
    const prototype = Object.getPrototypeOf(this);
    for (const name of Object.getOwnPropertyNames(prototype)) {
      if (name === "constructor") continue;
      // Patch all methods to reload the state from the store
      // This is equivalent to putting a decorator in front of each method
      const wrapped = prototype[name];
      this[name] = (...args) => {
        // Refresh the cached state
        this.#state = this.#get();
        if (this.#loading) return; // Ignore everything while loading
        // Call function normally, while also binding it
        return wrapped.apply(this, args);
      };
    }
  }

  /**
   * Processes changes from React Flow
   */
  onNodesChange(changes) {
    myOnNodesChange(changes, this.#state.nodes, this.#set);
  }

  /**
   * Loads this layer from the database
   */
  load(uid) {
    this.#loading = true;
    loadFromDb(uid).then(([nodes, edges, forwardConnections, backwardConnections]) => {
      this.#forwardConnections = forwardConnections;
      this.#backwardConnections = backwardConnections;

      // Reset depthFirstSearch
      const depthFirstSearch = {};
      const autoincremented = generateAutoincremented();
      for (const key in autoincremented) {
        depthFirstSearch[key] = autoincremented;
      }
      this.#depthFirstSearch = depthFirstSearch;

      this.#set({ nodes, edges, loadAutoincremented: generateAutoincremented() });
      this.#loading = false;
    });
  }

  /**
   * Saves this layer to the database
   */
  save(uid, notifySuccessElseError) {
    this.#loading = true;
    saveToDb(this.#state.nodes, this.#forwardConnections, uid).then(x => {
      this.#loading = false;
      notifySuccessElseError(x);
    });
  }

  /**
   * Inserts a new node
   */
  addNode(position) {
    const { nodes } = this.#state;
    // Reject upon intersection
    // Too bad it's not possible to know the dimensions of the current node to be added
    // So we will just hardcode some kind of size
    const { x: l, y: t } = position;
    const r = l + 100, b = t + 60;
    if (nodes.some(other => {
      const { x: oL, y: oT } = other.position;
      const oR = oL + other.width, oB = oT + other.height;
      return !(r < oL || l > oR || t > oB || b < oT);
    })) {
      console.log("dup");
      return;
    }
    // Allocate everything
    const id = generateAutoincremented().toString();
    this.#forwardConnections[id] = [];
    this.#backwardConnections[id] = [];
    this.#depthFirstSearch[id] = id;
    this.#set({ nodes: [...nodes, createNodeObject(id, l, t)] });
  }

  /**
   * Removes a node
   */
  deleteNode(id) {
    const forwardConnections = this.#forwardConnections;
    const backwardConnections = this.#backwardConnections;
    console.log(JSON.stringify(forwardConnections), JSON.stringify(backwardConnections));

    // Unlink everything touching this
    for (const connection of backwardConnections[id]) {
      arrayRemoveByValueIfPresent(forwardConnections[connection], id);
    }
    for (const connection of forwardConnections[id]) {
      arrayRemoveByValueIfPresent(backwardConnections[connection], id);
    }
    // Then delete the containers for this vertex
    delete forwardConnections[id];
    delete backwardConnections[id];
    delete this.#depthFirstSearch[id];

    const { nodes, edges } = this.#state;
    this.#set({
      nodes: nodes.filter(node => node.id !== id),
      edges: edges.filter(edge => edge.source !== id && edge.target !== id),
    });
    console.log(JSON.stringify(forwardConnections), JSON.stringify(backwardConnections));
  }

  /**
   * Saves the position of the node
   */
  markNodePosition(id) {
    this.#set({
      nodes: this.#state.nodes.map(
        node => node.id !== id ? node : { ...node, data: { ...node.data, savedPosition: node.position } },
      )
    });
  }

  /**
   * Moves the node back to the saved position
   */
  restoreNodePosition(id) {
    this.#set({
      nodes: this.#state.nodes.map(node => {
        if (node.id !== id) return node;
        const { savedPosition } = node.data;
        return !savedPosition ? node : { ...node, position: savedPosition };
      }),
    });
  }

  /**
   * Connects or disconnects two nodes
   */
  connectOrDisconnect(srcId, dstId) {
    const forwardConnections = this.#forwardConnections;
    const backwardConnections = this.#backwardConnections;
    if (forwardConnections[dstId].includes(srcId)) { // Backward connection found
      const tmp = dstId;
      dstId = srcId;
      srcId = tmp;
    } else if (!forwardConnections[srcId].includes(dstId)) { // No connection found
      // Check for cycles
      const autoincremented = generateAutoincremented();
      const depthFirstSearch = this.#depthFirstSearch;

      function dfs(otherId) {
        // Use autoincremented as a visited boolean
        if (depthFirstSearch[otherId] === autoincremented) return;
        depthFirstSearch[otherId] = autoincremented;
        // An invariant, somewhat related to induction, is that
        // the graph does not previously contain cycles.
        // Therefore, any newly added cycle must involve the newly added
        // node, so we only need to check if that is involved in any loop
        for (const connection of forwardConnections[otherId]) {
          // Use exceptions to unwind quickly
          if (connection === srcId) throw new Error();
          dfs(connection);
        }
      }

      try {
        dfs(dstId);
      } catch (_) {
        // Cycle detected, don't add edge
        return;
      }
      forwardConnections[srcId].push(dstId);
      backwardConnections[dstId].push(srcId);
      this.#set({ edges: [...this.#state.edges, createEdgeObject(srcId, dstId)] });
      return;
    } // else forward connection found, so will delete it
    const forward = forwardConnections[srcId];
    const backward = backwardConnections[dstId];
    forward.splice(forward.indexOf(dstId), 1);
    backward.splice(backward.indexOf(srcId), 1);
    this.#set({
      edges: this.#state.edges.filter(
        edge => edge.source !== srcId || edge.target !== dstId,
      ),
    });
  }

  /**
   * Changes the display name for a node
   */
  renameNode(id, name) {
    this.#set({
      nodes: this.#state.nodes.map(
        node => node.id !== id ? node : { ...node, data: { ...node.data, label: name } },
      ),
    });
  }
}

const useDisplayLayerStore = create((set, get) => ({
  nodes: [],
  edges: [],
  /**
   * Set to a new value on load. This is used as passing a callback to load() runs too early.
   */
  loadAutoincremented: generateAutoincremented(),
  /**
   * The actual operations
   */
  operations: new DisplayLayerOperations(set, get),
}));

export default useDisplayLayerStore;
