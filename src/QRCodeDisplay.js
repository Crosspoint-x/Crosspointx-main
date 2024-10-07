import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_STORE, FIREBASE_AUTH, FIREBASE_STORAGE } from './firebase'; // Firebase Storage included
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore imports
import { ref, uploadString, getDownloadURL } from 'firebase/storage'; // Firebase Storage functions
import { QRCodeSVG } from 'qrcode.react';
import { FaPrint, FaCamera } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeURL, setQRCodeURL] = useState(''); // Store QR Code public URL from Firebase Storage
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userEmail = user.email;

      // Generate the QR code based on user data
      setQrCodeValue(`User ID: ${userId}\nEmail: ${userEmail}`);

      // Ensure the user document exists in Firestore and fetch the QR code URL
      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          // Create the user document if it doesn't exist
          setDoc(userDocRef, {
            email: userEmail,
            createdAt: new Date(),
          });
        } else {
          const data = docSnap.data();
          if (data.qrCodeURL) {
            setQRCodeURL(data.qrCodeURL);
          } else {
            // If the QR code doesn't exist, generate and store it
            generateAndStoreQRCode(userId, userEmail);
          }
        }
      });
    }
  }, [user]);

  // Generate and store QR code in Firebase Storage, then save the download URL in Firestore
  const generateAndStoreQRCode = async (userId, userEmail) => {
    try {
      const qrCodeSVGElement = document.getElementById('qrCodeSVG');
      const svg = qrCodeSVGElement.querySelector('svg');
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(xml);
      const qrCodeDataURL = `data:image/svg+xml;base64,${svg64}`;

      // Create a reference to Firebase Storage
      const storageRef = ref(FIREBASE_STORAGE, `qrCodes/${userId}.svg`);

      // Upload the QR code SVG string to Firebase Storage
      await uploadString(storageRef, qrCodeDataURL, 'data_url');

      // Get the public download URL from Firebase Storage
      const downloadURL = await getDownloadURL(storageRef);
      setQRCodeURL(downloadURL);

      // Store the download URL in Firestore
      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      await setDoc(userDocRef, { qrCodeURL: downloadURL }, { merge: true });

      console.log('QR Code uploaded and URL stored in Firestore:', downloadURL);
    } catch (error) {
      console.error('Error generating and storing QR code:', error);
    }
  };

  // Handle sending the email with the QR code URL
  const handlePrintQRCode = async () => {
    const companyEmail = 'pointxcross@gmail.com';
  
    if (!qrCodeURL) {
      alert('QR code is not available yet. Please try again later.');
      return;
    }
  
    const emailParams = {
      to_email: companyEmail,
      from_name: user?.email,
      message: `Here is the QR code for user ${user?.email}. Click the link to download your QR code.`,
      qr_code_link: qrCodeURL, // Use the public download URL from Firebase Storage
    };
  
    console.log('Sending email with link:', qrCodeURL); // Log the URL to ensure it is being passed
  
    try {
      // Send the email using EmailJS
      await emailjs.send(
        'service_ibeqnoo', // Replace with your EmailJS Service ID
        'template_xq506xp', // Replace with your EmailJS Template ID
        emailParams,
        'kYByK16yPf30o8cft' // Replace with your EmailJS User ID
      );
      alert(`QR code link sent to ${companyEmail} for printing!`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send the email. Please try again later.');
    }
  };  

  return (
    <div className="qr-code-container">
      <h1>Your QR Code</h1>
      {qrCodeValue ? (
        <>
          <div id="qrCodeSVG">
            {qrCodeURL ? (
              <img
                src={qrCodeURL}
                alt="QR Code"
                style={{ width: '256px', height: '256px' }}
              />
            ) : (
              <p>Generating QR code...</p>
            )}
          </div>

          <div className="qr-code-actions">
            <FaPrint className="icon-print" onClick={handlePrintQRCode} />
            <FaCamera className="icon-camera" />
          </div>
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
    