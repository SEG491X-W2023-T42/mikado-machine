import { create } from "zustand";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";

const useDisplayLayerStore = create((set, get) => ({
  nodes: [],
  edges: [],
  setNodes(nodes) {
    set({ nodes });
  },
  setEdges(edges) {
    set({ edges });
  },
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
}));

export default useDisplayLayerStore;
