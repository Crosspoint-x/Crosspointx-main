// Import needed SDK functions
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Removed unused functions like `ref`, `push`, etc., unless they are used elsewhere in your code
// If you plan to use them later, you can add them back

const firebaseConfig = {
  apiKey: "AIzaSyDbHv2fJ4sIvH_MOFrsh57_JtAEwRVXVxM",
  authDomain: "crosspointx-8ed76.firebaseapp.com",
  databaseURL: "https://crosspointx-8ed76-default-rtdb.firebaseio.com",
  projectId: "crosspointx-8ed76",
  storageBucket: "crosspointx-8ed76.appspot.com",
  messagingSenderId: "487616820799",
  appId: "1:487616820799:web:3b3e778f52c3cbcfce2a8a",
  measurementId: "G-NQ8KP37E8Q"
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_STORE = getFirestore(FIREBASE_APP);

let FIREBASE_ANALYTICS;
isSupported().then((supported) => {
  if (supported) {
    FIREBASE_ANALYTICS = getAnalytics(FIREBASE_APP);
  }
});

export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_STORE, FIREBASE_ANALYTICS };