// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getRemoteConfig } from "firebase/remote-config";

// Your web app's Firebase configuration
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

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Firebase services
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_DB = getFirestore(FIREBASE_APP);
const FIREBASE_REMOTE = getRemoteConfig(FIREBASE_APP);

let FIREBASE_ANALYTICS;

isSupported().then((supported) => {
  if (supported) {
    FIREBASE_ANALYTICS = getAnalytics(FIREBASE_APP);
    console.log("Firebase Analytics initialized");
  } else {
    console.log("Firebase Analytics is not supported in this environment.");
  }
});

// Export Firebase services
export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB, FIREBASE_REMOTE, FIREBASE_ANALYTICS };
