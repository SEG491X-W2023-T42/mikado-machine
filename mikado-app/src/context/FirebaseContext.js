import { useContext, createContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebase } from '../firebase';

const ctxt = createContext();
const auth = getAuth(firebase);

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
