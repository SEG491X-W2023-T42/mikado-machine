import { connectFirestoreEmulator, doc, getDoc, getFirestore } from "firebase/firestore";
import { firebase, USING_DEBUG_EMULATORS } from "../firebase";

export const db = getFirestore(firebase);
if (USING_DEBUG_EMULATORS) {
  connectFirestoreEmulator(db, "localhost", 8080);
}

function sanitizeInt(x, fallback) {
  if (typeof x !== "number") return fallback;
  if (!Number.isFinite(x)) return fallback;
  if (x !== (x | 0)) return fallback;
  return x;
}

function sanitizeBoolean(x, fallback) {
  return typeof x === "boolean" ? x : fallback;
}

const sanitizers = [
  ["hideUnimplementedProfileMenuItems", sanitizeBoolean, true],
  ["hideProfileMenu", sanitizeBoolean, false],
  ["hideGraphControls", sanitizeBoolean, true],
  ["allowEditGraphName", sanitizeBoolean, true],
  ["allowEditNodeLabel", sanitizeBoolean, true],
  ["allowAddNode", sanitizeBoolean, true],
  ["allowRemoveNode", sanitizeBoolean, true],
  ["allowSubgraph", sanitizeBoolean, true],
  ["allowModifyNodeCompletion", sanitizeBoolean, true],
  ["nodePlacementSearchRadius", sanitizeInt, 200],
];

function sanitizeFlags(newFlags) {
  if (typeof newFlags !== "object") {
    newFlags = {};
  }
  const result = {};
  for (const validator of sanitizers) {
    const [key, typeValidator, fallback] = validator;
    result[key] = typeValidator(newFlags[key], fallback);
  }
  Object.freeze(result);
  return result;
}

let flags = sanitizeFlags({});

function setFlags(parsed) {
  if (parsed.version !== 1) {
    return false;
  }
  flags = sanitizeFlags(parsed.data);
  return true;
}

cache: try {
  const json = localStorage.getItem("gatekeeper");
  if (!json) break cache;
  const wrapped = JSON.parse(json);
  if (!setFlags(wrapped)) {
    localStorage.removeItem("gatekeeper");
  }
} catch (e) {
  console.error(e); // Don't crash
}

let didStartGatekeeperFlagFetch = false;
export function startGatekeeperFlagFetch() {
  if (didStartGatekeeperFlagFetch) return;
  didStartGatekeeperFlagFetch = true;
  getDoc(doc(db, "public", "flags")).then(docSnapshot => {
    if (!docSnapshot.exists()) {
      console.error("Feature flags DB schema changed");
      return;
    }
    if (!setFlags(docSnapshot.data())) {
      console.error("Client is out of date with feature flags schema");
      return;
    }
    try {
      // Store the sanitized values
      localStorage.setItem("gatekeeper", flags);
    } catch (e) {
      console.error(e);
    }
  });
}

export function getGatekeeperFlags() {
  return flags;
}
