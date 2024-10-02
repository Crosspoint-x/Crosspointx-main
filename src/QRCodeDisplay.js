import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_STORE, FIREBASE_DB, FIREBASE_AUTH } from './firebase'; // Firebase configuration
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    if (user) {
      // Generate QR code value based on user data
      const userId = user.uid;
      const userEmail = user.email;
      setQrCodeValue(`User ID: ${userId}\nEmail: ${userEmail}`);
    }
  }, [user]);

  return (
    <div className="qr-code-container">
      <h1>Your QR Code</h1>
      {qrCodeValue ? (
        <QRCodeSVG value={qrCodeValue} size={256} bgColor="#ffffff" fgColor="#333333" level="H" includeMargin={true} renderAs="svg" />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const QRCodeScanner = ({ locationId }) => {
  const [scannedPlayer, setScannedPlayer] = useState(null);

  const handleScan = async (qrValue) => {
    // Simulate scanning the QR code
    const scannedData = qrValue; // In production, this would come from a QR code scanner library

    const [userId] = scannedData.match(/User ID: (\w+)/);

    // Fetch user information from Firestore
    const userDocRef = doc(FIREBASE_STORE, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setScannedPlayer({ userId, ...userData });

      // Add the user as an active player in the specified location
      const playerRef = ref(FIREBASE_DB, `locations/${locationId}/activePlayers/${userId}`);
      await set(playerRef, {
        name: userData.name || userData.email,
        team: 'A', // Or assign based on logic
        isReferee: false,
      });
    } else {
      console.error('User not found');
    }
  };

  return (
    <div className="qr-scanner-container">
      <h2>Scan a Player's QR Code</h2>
      <input type="text" placeholder="Simulate Scan QR Value" onChange={(e) => handleScan(e.target.value)} />
      {scannedPlayer && (
        <div>
          <p>Scanned Player: {scannedPlayer.name}</p>
          <p>Added to Active Players for Location: {locationId}</p>
        </div>
      )}
    </div>
  );
};

export { QRCodeDisplay, QRCodeScanner };
