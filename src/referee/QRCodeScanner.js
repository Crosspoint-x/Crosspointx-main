import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_STORE, FIREBASE_AUTH } from '../firebase';
import { QrReader } from '@blackbox-vision/react-qr-reader'; // Import a QR code scanner library
import './QRCodeScanner.css';

const QRCodeScannerComponent = ({ locationId }) => {
  const [user] = useAuthState(FIREBASE_AUTH);
  const [scannedPlayer, setScannedPlayer] = useState(null);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null);
  const [playerList, setPlayerList] = useState([]);

  const handleScan = async (qrValue) => {
    if (!qrValue) return;

    const match = qrValue.match(/User ID: (\w+)/);
    if (!match) {
      setError('Invalid QR code format');
      return;
    }

    const userId = match[1];

    try {
      const userDocRef = doc(FIREBASE_STORE, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setScannedPlayer({ userId, ...userData });
        setPlayerList((prevList) => [...prevList, { userId, ...userData, team }]);

        const playerDocRef = doc(FIREBASE_STORE, `locations/${locationId}/activePlayers`, userId);
        await setDoc(playerDocRef, {
          name: userData.name || userData.email,
          team: team,
          isReferee: false,
        }, { merge: true });
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user document:', err);
      setError('Failed to fetch user data. Please try again.');
    }
  };

  const handleError = (err) => {
    console.error('QR Code scan error:', err);
    setError('QR scan failed. Please try again.');
  };

  return (
    <div className="qr-scanner-container">
      <h2>Scan a Player's QR Code</h2>
      <QrReader
        onResult={(result) => result?.text && handleScan(result.text)}
        onError={handleError}
        style={{ 
          width: '100%', 
          border: `5px solid ${team === 'A' ? 'red' : team === 'B' ? 'blue' : 'gray'}` 
        }}
      />
      
      <div className="team-buttons">
        <button 
          style={{ backgroundColor: 'red', color: 'white' }} 
          onClick={() => setTeam('A')}
        >
          TEAM A
        </button>
        <button 
          style={{ backgroundColor: 'blue', color: 'white' }} 
          onClick={() => setTeam('B')}
        >
          TEAM B
        </button>
      </div>
      
      <div className="status-container">
        <div className="status">
          <p>{scannedPlayer ? 'Verified' : 'Unknown*'}</p>
        </div>
        <div className="game-id">
          <p>Game ID</p>
        </div>
      </div>

      <div className="player-list">
        <h3>Scanned Players</h3>
        {playerList.map((player, index) => (
          <div key={index} className="player">
            <p>{player.name} - Team {player.team}</p>
          </div>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default QRCodeScannerComponent;
