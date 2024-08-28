// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_ANALYTICS = getAnalytics(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);