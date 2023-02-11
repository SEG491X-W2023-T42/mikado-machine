import { initializeApp  } from "firebase/app";

// Public credentials
const firebaseConfig = {
    apiKey: "AIzaSyAqv6_n045I2vtjTIAfDUB9m2l_pru4a6k",
    authDomain: "mikado-method.firebaseapp.com",
    projectId: "mikado-method",
    storageBucket: "mikado-method.appspot.com",
    messagingSenderId: "802728306359",
    appId: "1:802728306359:web:103ed63ed1ba448ef80f32"
  };
  
export const firebase = initializeApp(firebaseConfig);
