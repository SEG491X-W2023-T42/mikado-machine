import { useFirebase } from "./FirebaseContext";
import { createElement } from "react";
import { Navigate } from "react-router-dom";
import { startGatekeeperFlagFetch } from "../graphlayer/store/Gatekeeper";

function AuthenticatedUidWrapper({ wrapped, ...props }) {
  const { user, userLoaded } = useFirebase();
  const uid = user?.uid;

  // Make sure the user is signed in
  if (!userLoaded) return null; // Wait for Firebase to load the stored user to prevent losing the page on refresh
  if (!uid) return <Navigate to={"/"} />; // If the user isn't logged in, go to the home page so that they can sign in

  startGatekeeperFlagFetch();
  return createElement(wrapped, { ...props, uid }); // Let signed-in users reach the page they are looking for
}

export default AuthenticatedUidWrapper;
