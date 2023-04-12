import { useFirebase } from "./FirebaseContext";
import { createElement } from "react";
import { Navigate } from "react-router-dom";

function AuthenticatedUidWrapper({ wrapped, ...props }) {
  const { user, userLoaded } = useFirebase();
  const uid = user?.uid;

  // Make sure the user is signed in
  return (!userLoaded ? null : // Wait for Firebase to load the stored user to prevent losing the page on refresh
      !uid ? <Navigate to={"/"} /> : // If the user isn't logged in, go to the home page so that they can sign in
        createElement(wrapped, { ...props, uid }) // Let signed-in users reach the page they are looking for
  );
}

export default AuthenticatedUidWrapper;
