import { useContext, createContext, useState, useEffect } from 'react';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { firebase, USING_DEBUG_EMULATORS } from '../firebase';

const ctxt = createContext();
const auth = getAuth(firebase);
if (USING_DEBUG_EMULATORS) {
  connectAuthEmulator(auth, "http://localhost:9099")
}

export const FirebaseContextProvider = ({children}) => {

  // Used for auth, propogates throughout whole app
  const [user, setUser] = useState({});

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
  }

  // If auth is approved, yeet the user value
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsub();
    }
  }, [])

  return (
    <ctxt.Provider value={{googleSignIn, user}}>
      {children}
    </ctxt.Provider>
  );
}

export const FirebaseContext = () => {
  return useContext(ctxt);
}
