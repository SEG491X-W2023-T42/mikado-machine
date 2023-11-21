import { createContext, useContext } from 'react';
const StoreHackContext = createContext(void 0);
const useStoreHack = () => useContext(StoreHackContext);
export { StoreHackContext, useStoreHack };
