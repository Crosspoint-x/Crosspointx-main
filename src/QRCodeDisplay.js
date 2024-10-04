import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_STORE, FIREBASE_AUTH } from './firebase'; // Firebase configuration
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore imports
import { QRCodeSVG } from 'qrcode.react';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userEmail = user.email;

      // Generate the QR code based on user data
      setQrCodeValue(`User ID: ${userId}\nEmail: ${userEmail}`);

      // Ensure the user document exists in Firestore
      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          // Create the user document if it doesn't exist
          setDoc(userDocRef, {
            email: userEmail,
            createdAt: new Date(),
          });
        }
      });
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

    // Extract the user ID from the scanned data (assuming the format is "User ID: xxx")
    const match = scannedData.match(/User ID: (\w+)/);
    if (!match) {
      console.error('Invalid QR code format');
      return;
    }

    const userId = match[1]; // Extract userId from the regex match

    // Fetch user information from Firestore
    const userDocRef = doc(FIREBASE_STORE, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setScannedPlayer({ userId, ...userData });

      // Add the user as an active player in the specified location in Firestore
      const playerDocRef = doc(FIREBASE_STORE, `locations/${locationId}/activePlayers`, userId);
      await setDoc(playerDocRef, {
        name: userData.name || userData.email,
        team: 'A', // Or assign based on logic
        isReferee: false,
      }, { merge: true }); // Use merge to update existing data or create new
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
