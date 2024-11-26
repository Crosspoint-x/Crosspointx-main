import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_STORE, FIREBASE_AUTH, FIREBASE_STORAGE } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from 'qrcode.react';
import { FaPrint, FaCamera } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import './QRCodeDisplay.css';

const QRCodeDisplay = () => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [qrCodeURL, setQRCodeURL] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    if (user) {
      const userId = user.uid;
      const userEmail = user.email;

      setQrCodeValue(`User ID: ${userId}\nEmail: ${userEmail}`);

      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, {
            email: userEmail,
            createdAt: new Date(),
          });
        } else {
          const data = docSnap.data();
          if (data.qrCodeURL) {
            setQRCodeURL(data.qrCodeURL);
          } else {
            generateAndStoreQRCode(userId, userEmail);
          }
        }
      });
    }
  }, [user]);

  const generateAndStoreQRCode = async (userId, userEmail) => {
    try {
      const qrCodeSVGElement = document.getElementById('qrCodeSVG');
      const svg = qrCodeSVGElement.querySelector('svg');
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(xml);
      const qrCodeDataURL = `data:image/svg+xml;base64,${svg64}`;

      const storageRef = ref(FIREBASE_STORAGE, `qrCodes/${userId}.svg`);
      await uploadString(storageRef, qrCodeDataURL, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      setQRCodeURL(downloadURL);

      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      await setDoc(userDocRef, { qrCodeURL: downloadURL }, { merge: true });

      console.log('QR Code uploaded and URL stored in Firestore:', downloadURL);
    } catch (error) {
      console.error('Error generating and storing QR code:', error);
    }
  };

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
      qr_code_link: qrCodeURL,
    };
  
    console.log('Sending email with link:', qrCodeURL);
  
    try {
      await emailjs.send(
        'service_ibeqnoo',
        'template_xq506xp',
        emailParams,
        'kYByK16yPf30o8cft'
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
  const [team, setTeam] = useState('A'); // Default to Team A
  const [gameId, setGameId] = useState('');

  const handleScan = async (qrValue) => {
    const scannedData = qrValue;

    const match = scannedData.match(/User ID: (\w+)/);
    if (!match) {
      console.error('Invalid QR code format');
      return;
    }

    const userId = match[1];

    const userDocRef = doc(FIREBASE_STORE, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setScannedPlayer({ userId, ...userData });

      const playerDocRef = doc(FIREBASE_STORE, `locations/${locationId}/activePlayers`, userId);
      await setDoc(playerDocRef, {
        name: userData.name || userData.email,
        team,
        gameId,
        isReferee: false,
      }, { merge: true });
    } else {
      console.error('User not found');
    }
  };

  return (
    <div className="qr-scanner-container">
      <h2>Scan a Player's QR Code</h2>
      <div className="team-buttons">
        <button 
          className={`team-button ${team === 'A' ? 'active' : ''}`} 
          onClick={() => setTeam('A')}
        >
          Team A
        </button>
        <button 
          className={`team-button ${team === 'B' ? 'active' : ''}`} 
          onClick={() => setTeam('B')}
        >
          Team B
        </button>
      </div>
      <input 
        type="text" 
        placeholder="Enter Game ID" 
        value={gameId} 
        onChange={(e) => setGameId(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Simulate Scan QR Value" 
        onChange={(e) => handleScan(e.target.value)} 
      />
      {scannedPlayer && (
        <div>
          <p>Scanned Player: {scannedPlayer.name}</p>
          <p>Added to Active Players for Location: {locationId}</p>
        </div>
      )}
      <button className="exit-button" onClick={() => setScannedPlayer(null)}>
        Exit
      </button>
    </div>
  );
};

export { QRCodeDisplay, QRCodeScanner };
