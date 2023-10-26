// __mocks__/mockUseDisplayLayerStore.js
import * as Counter from "../src/viewmodel/autoincrement";
import DisplayLayerOperations from "../src/viewmodel/displayLayerStore"; 

// Mock Zustand's create function
export const create = jest.fn(initial => {
    const store = {
      ...initial,
      set: jest.fn(),
      get: jest.fn(() => store),
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
  
  const mockUseDisplayLayerStore = () => {
    const store = create({
    nodes: [],
    edges: [],
    loadAutoincremented: Counter.generateAutoincremented,
    //operations: new DisplayLayerOperations(store.set, store.get),
    operations: new DisplayLayerOperations(jest.fn(), jest.fn()),
    editingNodeId: "",
    editingNodeInitialValue: "",
    // editNode(id, initialValue) {
    //   store.set({...store, editingNodeId: id, editingNodeInitialValue: initialValue});
    // },
    editNode: jest.fn(),
  });

  // Pass the store to DisplayLayerOperations after it's created
  store.operations = new DisplayLayerOperations(store.set, store.get);

  // Add the editNode method to the store
  store.editNode = (id, initialValue) => {
    store.set({ ...store, editingNodeId: id, editingNodeInitialValue: initialValue });
  };

  return store;
};
  
  export default mockUseDisplayLayerStore;
  