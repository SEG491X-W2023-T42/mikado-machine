import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges, MarkerType } from "reactflow";
import { loadFromDb, saveToDb } from "./serde";

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
  onNodesChange(changes) {
    const state = get();
    if (state.loading) return;
    set({
      nodes: applyNodeChanges(changes, state.nodes),
    });
  },
  onEdgesChange(changes) {
    const state = get();
    if (state.loading) return;
    set({
      edges: applyEdgeChanges(changes, state.edges),
    });
  },
  onConnect(connection) {
    const state = get();
    if (state.loading) return;
    set({
      edges: addEdge(connection, state.edges),
    });
  },
  load(uid) {
    set({ loading: true });
    loadFromDb(uid).then(([nodes, edges]) => set({ nodes, edges, loading: false }));
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
