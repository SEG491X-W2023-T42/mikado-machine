// __mocks__/mockUseDisplayLayerStore.js
import * as Counter from "../src/viewmodel/autoincrement";

// Mock Zustand's create function
export const create = jest.fn(initial => {
    const store = {
      ...initial,
      // Add other Zustand functions if needed
    };
  
    // Mock the set function
    store.set = jest.fn(updates => {
      Object.assign(store, updates);
      return store;
    });
  
    // Mock the get function
    store.get = jest.fn(() => store);
  
    return store;
  });
  
  const mockUseDisplayLayerStore = () => create({
    nodes: [],
    edges: [],
    loadAutoincremented: Counter.generateAutoincremented,
    operations: new DisplayLayerOperations(store.set, store.get),
    editingNodeId: "",
    editingNodeInitialValue: "",
    editNode(id, initialValue) {
      store.set({...store, editingNodeId: id, editingNodeInitialValue: initialValue});
    },
  });
  
  export default mockUseDisplayLayerStore;
  