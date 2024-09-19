import React from 'react';
import { useEffect, useState } from "react";
import { FIREBASE_DB } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_AUTH } from "./firebase";
import { Timestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import './QRCodeDisplay.css';

console.log("Rendering QRCodeDisplay component");


const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCode, setQRCode] = useState('');

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userRef = doc(FIREBASE_DB, 'users', userId);
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          setQRCode(doc.data().qrCode);
        }
      });
    }
  }, [user]);

  return (
    <div>
      <h1>Your QR Code</h1>
      {qrCode ? (
        <img src={qrCode} alt="QR Code" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;