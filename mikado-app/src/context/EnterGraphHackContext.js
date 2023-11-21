import { createContext, useContext } from 'react';
const EnterGraphHackContext = createContext(void 0);
const useEnterGraphHack = () => useContext(EnterGraphHackContext);
export { EnterGraphHackContext, useEnterGraphHack };

/*
 * TODO refactor
 * This thing introduces a serious coupling problem between various components of ours in the DOM hierarchy
 * They should use effects to talk to each other, not passing one-off functions like this
 * Perhaps create a separate Zustand store for the display layer
 */
