import React from 'react';
const { render, screen, fireEvent } = require('@testing-library/react');
import * as Counter from "../../src/viewmodel/autoincrement";
// import DisplayLayerOperations from '../../src/viewmodel/displayLayerStore';
// mocked zustand
import mockUseDisplayLayerStore from "../../__mocks__/mockuseDisplayLayerStore";

// Your test suite
describe('addNode method', () => {
  // Mock the Counter module used in DisplayLayerOperations
  jest.mock('../../src/viewmodel/autoincrement', () => {
    let counter = 1;
    return {
      generateAutoincremented: jest.fn(() => counter++),
      // no clue if this is doing what it should
    };
  });

  // not sure if should mock serde? i don't think i should?

  // try addNode
  it('should add a node', async () => {
    // Render your component or initialize your functions
    render(<mockUseDisplayLayerStore />);

    // Access the mocked Zustand store
    const store = mockUseDisplayLayerStore();

    // Mock the modifyNodePosition function to return a valid position
    jest.spyOn(store.operations, 'modifyNodePosition').mockReturnValue({ x: 100, y: 100 });

    // Act: Call the addNode method
    await act(async () => {
      store.operations.addNode({ x: 100, y: 100 });
    });

    // Assert: Check if the node was added
    expect(store.nodes).toHaveLength(1);
    expect(store.nodes[0].id).toEqual('mocked-id'); // Adjust as needed
    expect(store.nodes[0].position).toEqual({ x: 100, y: 100 });
  });
});