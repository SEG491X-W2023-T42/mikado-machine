import { create } from "zustand";
import { applyNodeChanges } from "reactflow";
import { loadFromDb, saveToDb } from "./serde";
import generateAutoincremented from "./autoincrement";

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
  onNodesChange(changes) {
    const state = get();
    if (state._internal.loading) return;
    set({
      nodes: applyNodeChanges(changes, state.nodes),
    });
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
}));

export default useDisplayLayerStore;
