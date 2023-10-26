// __mocks__/zustand.js
const zustand = require('zustand');
const { act } = require('@testing-library/react');

const { create: actualCreate, createStore: actualCreateStore } = zustand;

// A variable to hold reset functions for all stores declared in the app
const storeResetFns = new Set();

const createUncurried = (stateCreator) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// When creating a store, we get its initial state, create a reset function and add it to the set
const create = (stateCreator) => {
  console.log('zustand create mock');

  // To support the curried version of create
  return typeof stateCreator === 'function'
    ? createUncurried(stateCreator)
    : createUncurried;
};

const createStoreUncurried = (stateCreator) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// When creating a store, we get its initial state, create a reset function and add it to the set
const createStore = (stateCreator) => {
  console.log('zustand createStore mock');

  // To support the curried version of createStore
  return typeof stateCreator === 'function'
    ? createStoreUncurried(stateCreator)
    : createStoreUncurried;
};

// Reset all stores after each test run
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
});

module.exports = { create, createStore };
