import { useFirebase } from "./FirebaseContext";
import { createElement } from "react";
import { Navigate } from "react-router-dom";

function AuthenticatedUidWrapper({ wrapped, ...props }) {
  const { user } = useFirebase();
  const uid = user?.uid;

  // Make sure the user is signed in
  return uid ? createElement(wrapped, { ...props, uid }) : <Navigate to={"/"} />;
}

export default AuthenticatedUidWrapper;
