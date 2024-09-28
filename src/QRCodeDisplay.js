import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FIREBASE_AUTH } from './firebase';
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
        <QRCodeSVG value={qrCodeValue} size={256} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default QRCodeDisplay;
