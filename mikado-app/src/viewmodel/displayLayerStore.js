import { create } from "zustand";
import { loadFromDb, saveToDb } from "./serde";
import generateAutoincremented from "./autoincrement";

function myOnNodesChange(changes, nodes, set) {
  const changesById = {};
  let affected = false;
  for (const change of changes) {
    const { id, type } = change;
    // Ignore dimensions, the DB can't persist it anyway
    // Ignore add, remove, reset. Those changes should be done through this viewmodel
    switch (type) {
      case "select":
      case "position":
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
            // noinspection BadExpressionStatementJS
            dragging ?? (node.dragging = dragging);
            // Ignoring positionAbsolute and expandParent as the DB can't persist them
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

const useDisplayLayerStore = create((set, get) => ({
  nodes: [],
  edges: [],
  /**
   * Internal object modified directly, and avoids getting in the way of the shallow comparison.
   */
  _internal: {
    /**
     * A loading indicator.
     *
     * React sometimes likes to run useEffect twice, so this variable must be assigned directly and immediately.
     * This also helps with preventing other race conditions.
     */
    loading: false,
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
    forwardConnections: {},
    /**
     * Similar to forwardConnections.
     *
     * Used mainly for deletion.
     */
    backwardConnections: {},
    /**
     * A scratch area for depth-first search.
     */
    depthFirstSearch: {},
  },
  /**
   * Set to a new value on load. This is used passing a callback to load() runs too early.
   */
  loadAutoincremented: generateAutoincremented(),
  /**
   * Separate object to skip shallow compare of all those methods.
   */
  operations: {
    onNodesChange(changes) {
      const state = get();
      if (state._internal.loading) return;
      myOnNodesChange(changes, state.nodes, set);
    },
    load(uid) {
      const { _internal } = get();
      if (_internal.loading) return;
      _internal.loading = true;
      loadFromDb(uid).then(([nodes, edges, forwardConnections, backwardConnections]) => {
        _internal.forwardConnections = forwardConnections;
        _internal.backwardConnections = backwardConnections;

        // Reset depthFirstSearch
        const depthFirstSearch = {};
        const autoincremented = generateAutoincremented();
        for (const key in autoincremented) {
          depthFirstSearch[key] = autoincremented;
        }
        _internal.depthFirstSearch = depthFirstSearch;

        set({ nodes, edges, loadAutoincremented: generateAutoincremented() });
        _internal.loading = false;
      });
    },
    save(uid, notifySuccessElseError) {
      const { nodes, _internal } = get();
      if (_internal.loading) return;
      _internal.loading = true;
      saveToDb(nodes, _internal.forwardConnections, uid).then(x => {
        _internal.loading = false;
        notifySuccessElseError(x);
      });
    },
    addNode(position) {
    },
    deleteNode(id) {
    },
    /**
     * Saves the position of the node.
     */
    markNodePosition(id) {
      const { nodes, _internal } = get();
      if (_internal.loading) return;
      console.log("mark", nodes);
      set({
        nodes: nodes.map(node => node.id !== id ? node : { ...node, data: { ...node.data, savedPosition: node.position } }),
      });
    },
    /**
     * Moves the node back to the saved position.
     */
    restoreNodePosition(id) {
      const { nodes, _internal } = get();
      if (_internal.loading) return;
      set({
        nodes: nodes.map(node => {
          if (node.id !== id) return node;
          const { savedPosition } = node.data;
          console.log("restore", savedPosition);
          return !savedPosition ? node : { ...node, position: savedPosition };
        }),
      });
    },
    connectOrDisconnect(src, dst) {
    },
  }
}));

export default useDisplayLayerStore;
