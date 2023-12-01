const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const TARGET_FEATURE_FLAGS = {
  version: 1,
  data: {
   hideUnimplementedProfileMenuItems: true,
   hideProfileMenu: false,
   hideGraphControls: true,
   allowEditGraphName: true,
   allowEditNodeLabel: true,
   allowAddNode: true,
   allowRemoveNode: true,
   allowSubgraph: true,
   allowModifyNodeCompletion: true,
   nodePlacementSearchRadius: 200,
   enableQuestline: true,
  }
}

const firebase = initializeApp({
  apiKey: "AIzaSyAqv6_n045I2vtjTIAfDUB9m2l_pru4a6k",
  authDomain: "mikado-method.firebaseapp.com",
  projectId: "mikado-method",
  storageBucket: "mikado-method.appspot.com",
  messagingSenderId: "802728306359",
  appId: "1:802728306359:web:103ed63ed1ba448ef80f32"
});
const db = getFirestore(firebase);

(async function() {
  const doc = await db.collection("public").doc("flags");
  const result = await doc.set(TARGET_FEATURE_FLAGS);
  console.log(result);
})().then(() => console.log("Done"));
