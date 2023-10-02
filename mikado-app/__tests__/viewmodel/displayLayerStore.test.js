// const { render, screen, fireEvent } = require('@testing-library/react');
import useDisplayLayerStore from '../../src/viewmodel/displayLayerStore';

describe('useDisplayLayerStore', () => {
  let store;

  beforeEach(() => {
    store = useDisplayLayerStore();
    console.log(store);
  });

  test('addNode adds a new node', () => {
    store.addNode({ x: 100, y: 100 });
    const nodes = store.getState().nodes;
    expect(nodes.length).toBe(1);
  });
  
});
