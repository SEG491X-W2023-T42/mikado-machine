import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'; // for additional matchers
import { useGraphLayerViewerStore } from '../src/graphlayer/store/GraphLayerViewerStore.js'; // adjust the path accordingly

// Mock dependencies
jest.mock('../src/graphlayer/store/GraphLayerViewerStore.js', () => ({
    useGraphLayerViewerStore: jest.fn(() => ({
        operations: {
          addNode: jest.fn(),
          modifyNodePosition: jest.fn(),
          // ... other operations mock as needed
        },
        getState: jest.fn(() => ({
            nodes: [], // or your initial state
            // ... other properties if needed
          })),
    })),
}));

jest.mock('../src/helpers/Api.js', () => ({
  loadFromDb: jest.fn(() => Promise.resolve([/* mock data */])),
  saveToDb: jest.fn(() => Promise.resolve(/* mock response */)),
}));

jest.mock('../src/helpers/Autoincrement.js', () => ({
  generateAutoincremented: jest.fn(),
}));

jest.mock('../src/graphlayer/store/DisplayObjectFactory.js', () => ({
  createEdgeObject: jest.fn(),
  createNodeObject: jest.fn(),
}));

jest.mock('../src/helpers/CollisionDetection.js', () => ({
  createIntersectionDetectorFor: jest.fn(),
}));

jest.mock('../src/graphlayer/store/Assert.js', () => ({
  runtime_assert: jest.fn(),
}));

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(),
}));

jest.mock('react-dom', () => ({
  flushSync: jest.fn(),
}));

jest.mock('../src/graph/components/nodes/Node.js', () => jest.fn());

jest.mock('../src/graphlayer/store/Gatekeeper.js', () => ({
  getGatekeeperFlags: jest.fn(),
}));

// Export mocks for use in test files
export {
    useGraphLayerViewerStore,
};