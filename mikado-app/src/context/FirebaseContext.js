import { useContext, createContext, useState, useEffect } from 'react';
import { 
  connectAuthEmulator, 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut } 
from 'firebase/auth';
import { firebase, USING_DEBUG_EMULATORS } from '../firebase';

const ctxt = createContext(void 0);
const auth = getAuth(firebase);
if (USING_DEBUG_EMULATORS) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
}

export const FirebaseContextProvider = ({ children }) => {
  // Used for auth, propogates throughout whole app
  const [userLoaded, setUserLoaded] = useState(false);
  const [user, setUser] = useState({});

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }

  const logOut = () => {
    signOut(auth);
  }

  // If auth is approved, yeet the user value
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserLoaded(true);
    });
    return () => {
      unsub();
    }
  }, [])

  return (
    <ctxt.Provider value={{ googleSignIn, logOut, user, userLoaded }}>
      {children}
    </ctxt.Provider>
  );
}

export const useFirebase = () => {
  return useContext(ctxt);
}
