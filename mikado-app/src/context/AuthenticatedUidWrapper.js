import { useFirebase } from "./FirebaseContext";
import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthenticatedUidWrapper({ wrapped, ...props }) {
  const { user } = useFirebase();
  const navigate = useNavigate();
  const [uid, setUid] = useState("");

  // Make sure the user is signed in
  useEffect(() => {
    if (user != null) {
      if (Object.keys(user).length === 0) {
        navigate('/');
      } else {
        setUid(user.uid);
      }
    }

    if (user == null) {
      navigate('/');
    }
  }, [navigate, user]);

  return uid && createElement(wrapped, { ...props, uid });
}

export default AuthenticatedUidWrapper;
