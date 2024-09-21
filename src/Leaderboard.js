import React, { useState, useEffect } from 'react';
import { collection, doc, runTransaction, getDocs, setDoc, query, where, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase.js'; // Your custom Firebase export
import './Leaderboard.css'; // CSS for styling the leaderboard

async function createPlayer(uid, playerName) {
  try {
    await setDoc(doc(FIREBASE_DB, 'players', uid), {
      playerName: playerName,
      level: 1,
      highScore: 0,
      wins: 0,
      losses: 0,
      winLossRatio: 0.0,
    });
    console.log('Player created successfully!');
  } catch (error) {
    console.error('Error creating player: ', error);
  }
}

// Function to update player stats
async function updatePlayerStats(playerID, wins, losses) {
  const playerRef = doc(FIREBASE_DB, 'players', playerID);
  const playerSnapshot = await getDocs(playerRef);
  if (playerSnapshot.exists()) {
    const data = playerSnapshot.data();
    const newWins = data.wins + wins;
    const newLosses = data.losses + losses;
    const newRatio = (newWins / (newWins + newLosses)).toFixed(2);

    await updateDoc(playerRef, {
      wins: newWins,
      losses: newLosses,
      winLossRatio: newRatio,
    });
  }
}

const LeaderboardComponent = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersQuery = collection(FIREBASE_DB, 'players');
      const playerDocs = await getDocs(playersQuery);
      const fetchedPlayers = playerDocs.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setPlayers(fetchedPlayers);
    };

    fetchPlayers();
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win/Loss Ratio</th>
            <th>High Score</th>
          </tr>
        </thead>
        <tbody>
          {players.sort((a, b) => b.highScore - a.highScore).map((player, index) => (
            <tr key={index}>
              <td>{player.playerName}</td>
              <td>{player.wins}</td>
              <td>{player.losses}</td>
              <td>{player.winLossRatio}</td>
              <td>{player.highScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { LeaderboardComponent, updatePlayerStats, createPlayer }; // Export the component and utility functions