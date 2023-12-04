import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useGraphLayerViewerStore } from '../../__mocks__/MockGraphLayerViewerStore.js';

describe('addNode function', () => {
  let store;

  beforeEach(() => {
    store = useGraphLayerViewerStore();
  });

  it('adds a new node on valid position', () => {
    const position = { x: 100, y: 100 };

    act(() => {
      store.operations.addNode(position);
    });

    const nodes = store.getState().nodes;
    expect(nodes).toHaveLength(1);

    const newNode = nodes[0];
    expect(newNode.position).toEqual(position);
    // Add more assertions based on your node structure
  });

  it('does not add a new node on invalid position', () => {
    // Mock a case where the position is already occupied
    jest.spyOn(store.operations, 'modifyNodePosition').mockReturnValue(null);

    const position = { x: 100, y: 100 };

    act(() => {
      store.operations.addNode(position);
    });

    const nodes = store.getState().nodes;
    expect(nodes).toHaveLength(0); // No new node should be added

    // Restore the original implementation
    jest.spyOn(store.operations, 'modifyNodePosition').mockRestore();
  });

  it('calls onNodeDrag when a node is being dragged', () => {
    // Mock a node
    const node = { id: 'node-1', position: { x: 100, y: 100 } };
    store.operations.addNode(node.position, node.id);

    render(<GraphLayerViewerInternal uid="123" graph={{ id: 'graph-1', subgraph: 'subgraph-1' }} />);

    // Drag the node
    act(() => {
      fireEvent.dragStart(screen.getByLabelText('Node 1'), { dataTransfer: { setData: jest.fn() } });
      fireEvent.drag(screen.getByLabelText('Node 1'), { clientX: 120, clientY: 120 });
      fireEvent.dragEnd(screen.getByLabelText('Node 1'));
    });

    // Assertions for onNodeDrag
    const targetNode = store.operations.getNode('node-1');
    expect(targetNode.position).toEqual({ x: 120, y: 120 });

    // Cleanup
    store.operations.removeNode('node-1');
  });

  it('calls startEditingNode when a node is double-clicked', () => {
    // Mock a node
    const node = { id: 'node-1', position: { x: 100, y: 100 } };
    store.operations.addNode(node.position, node.id);

    render(<GraphLayerViewerInternal uid="123" graph={{ id: 'graph-1', subgraph: 'subgraph-1' }} />);

    // Double-click the node
    act(() => {
      fireEvent.dblClick(screen.getByLabelText('Node 1'));
    });

    // Assertions for startEditingNode
    const editingNodeId = store.getState().editingNodeId;
    expect(editingNodeId).toBe('node-1');

    // Cleanup
    store.operations.removeNode('node-1');
  });
});
