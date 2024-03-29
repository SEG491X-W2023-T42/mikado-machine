import { useContext, createContext, useState, useEffect } from 'react';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut }
from 'firebase/auth';
import { DEBUG_EMULATORS_HOSTNAME, firebase, USING_DEBUG_EMULATORS } from '../Firebase';

const ctxt = createContext(void 0);
const auth = getAuth(firebase);
if (USING_DEBUG_EMULATORS) {
  connectAuthEmulator(auth, `http://${DEBUG_EMULATORS_HOSTNAME}:9099`, { disableWarnings: true })
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

  const getGoogleDisplayName = () => {
    if (user != null) {
      return user.auth.currentUser.displayName;
    }
  }

  const getGoogleProfilePicture = () => {
    if (user != null) {
      return user.auth.currentUser.photoURL;
    }
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
    <ctxt.Provider value={{ googleSignIn, logOut, getGoogleDisplayName, getGoogleProfilePicture, user, userLoaded}}>
      {children}
    </ctxt.Provider>
  );
}

export const useFirebase = () => {
  return useContext(ctxt);
}
