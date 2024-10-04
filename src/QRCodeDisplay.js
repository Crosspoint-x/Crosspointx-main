import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_STORE, FIREBASE_AUTH } from './firebase'; // Firebase configuration
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore imports
import { QRCodeSVG } from 'qrcode.react';
import { FaPrint, FaCamera } from 'react-icons/fa'; // Icons for print and camera
import QrScanner from 'react-qr-scanner'; // QR code scanner component
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [scanning, setScanning] = useState(false); // Toggle QR scanning
  const [scannedData, setScannedData] = useState(''); // Store scanned QR code data

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

  // Handle printing QR Code (send to company email)
  const handlePrintQRCode = async () => {
    const companyEmail = "company@example.com"; // Replace with your company's email
    const emailData = {
      to: companyEmail,
      subject: `QR Code for User ${user?.email}`,
      body: `Here is the QR code for user ${user?.email}: \nQR Data: ${qrCodeValue}`,
    };

    try {
      console.log("Sending QR code to company for printing: ", emailData);
      alert(`QR code sent to ${companyEmail} for printing!`);
    } catch (error) {
      console.error("Error sending email: ", error);
    }
  };

  // Start QR scanning process
  const handleScanQRCode = () => {
    setScanning(true);
  };

  // Handle the result of QR code scanning
  const handleScan = (result) => {
    if (result) {
      setScannedData(result.text); // Store the scanned data
      setScanning(false); // Stop scanning after a successful scan
    }
  };

  const handleError = (error) => {
    console.error("QR scan error: ", error);
  };

  return (
    <div className="qr-code-container">
      <h1>Your QR Code</h1>
      {qrCodeValue ? (
        <>
          {/* Display the user's QR code */}
          <QRCodeSVG value={qrCodeValue} size={256} bgColor="#ffffff" fgColor="#333333" level="H" includeMargin={true} renderAs="svg" />

          {/* Print and Scan Actions */}
          <div className="qr-code-actions">
            {/* Printer Icon */}
            <FaPrint className="icon-print" onClick={handlePrintQRCode} />
            {/* Camera Icon */}
            <FaCamera className="icon-camera" onClick={handleScanQRCode} />
          </div>

          {/* QR Code Scanner */}
          {scanning && (
            <div className="qr-scanner">
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
              <button onClick={() => setScanning(false)}>Cancel</button>
            </div>
          )}

          {/* Display Scanned Data */}
          {scannedData && (
            <div className="scanned-data">
              <h3>Scanned Data:</h3>
              <p>{scannedData}</p>
            </div>
          )}
        </>
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
  