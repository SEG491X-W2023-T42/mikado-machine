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
      loadFromDb(uid).then(([nodes, edges]) => {
        _internal.loading = false;
        set({ nodes, edges, loadAutoincremented: generateAutoincremented() });
      });
    },
    save(uid, notifySuccessElseError) {
      const { nodes, edges, _internal } = get();
      if (_internal.loading) return;
      _internal.loading = true;
      saveToDb(nodes, edges, uid).then(x => {
        _internal.loading = false;
        notifySuccessElseError(x);
      });
    },
  }
}));

export default useDisplayLayerStore;
