import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges, MarkerType } from "reactflow";
import { loadFromDb, saveToDb } from "./serde";
import generateAutoincremented from "./autoincrement";

const useDisplayLayerStore = create((set, get) => ({
  nodes: [],
  edges: [],
  /**
   * A loading indicator.
   *
   * React sometimes likes to run useEffect twice.
   * This also helps with preventing other race conditions.
   */
  loading: false,
  /**
   * Set to a new value on load. This is used passing a callback to load() runs too early.
   */
  loadAutoincremented: generateAutoincremented(),
  onNodesChange(changes) {
    const state = get();
    if (state.loading) return;
    set({
      nodes: applyNodeChanges(changes, state.nodes),
    });
  },
  load(uid) {
    set({ loading: true });
    loadFromDb(uid).then(([nodes, edges]) => set({ nodes, edges, loading: false, loadAutoincremented: generateAutoincremented() }));
  },
  save(uid, notifySuccessElseError) {
    const { nodes, edges, loading } = get();
    if (loading) return;
    set({ loading: true });
    saveToDb(nodes, edges, uid).then(x => {
      set({ loading: false });
      notifySuccessElseError(x);
    });
  },
}));

export default useDisplayLayerStore;
