import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges, MarkerType } from "reactflow";
import { loadFromDb, saveToDb } from "./serde";

const useDisplayLayerStore = create((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect(connection) {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  load(uid) {
    loadFromDb(uid).then(([nodes, edges]) => set({ nodes, edges }));
  },
  save(uid, notifySuccessElseError) {
    const { nodes, edges } = get();
    saveToDb(nodes, edges, uid).then(notifySuccessElseError);
  },
}));

export default useDisplayLayerStore;
