import React, { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { FIREBASE_STORE } from './firebase'; 
import './Leaderboard.css';

const calculateElo = (winnerElo, loserElo) => {
  const kFactor = 32; // A standard K-factor for Elo systems
  const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedScoreLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  // Elo formula: newRating = oldRating + kFactor * (actualScore - expectedScore)
  const newWinnerElo = Math.round(winnerElo + kFactor * (1 - expectedScoreWinner));
  const newLoserElo = Math.round(loserElo + kFactor * (0 - expectedScoreLoser));

  return { newWinnerElo, newLoserElo };
};

// Function to update Firestore with match result and Elo calculations
const updateLeaderboardWithMatchResult = async (winnerId, loserId) => {
  try {
    const winnerRef = doc(FIREBASE_STORE, 'leaderboard', winnerId);
    const loserRef = doc(FIREBASE_STORE, 'leaderboard', loserId);

    // Fetch current Elo ratings for both players
    const winnerSnap = await getDoc(winnerRef);
    const loserSnap = await getDoc(loserRef);

    if (winnerSnap.exists() && loserSnap.exists()) {
      const winnerData = winnerSnap.data();
      const loserData = loserSnap.data();

      const winnerElo = winnerData.elo || 1000; // Default Elo of 1000
      const loserElo = loserData.elo || 1000;

      // Calculate new Elo ratings
      const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);

      // Update Firestore with new values
      await updateDoc(winnerRef, {
        wins: (winnerData.wins || 0) + 1,
        elo: newWinnerElo
      });

      await updateDoc(loserRef, {
        losses: (loserData.losses || 0) + 1,
        elo: newLoserElo
      });

      console.log(`Elo ratings updated! Winner: ${newWinnerElo}, Loser: ${newLoserElo}`);
    } else {
      console.error('One or both players not found in leaderboard.');
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(FIREBASE_STORE, 'leaderboard'),
      (snapshot) => {
        const scoreList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(), // Get player data from Firestore
        }));
        setScores(scoreList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leaderboard:', error);
      }
    );

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <div className='leaderboard'>
        <table className="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>W/L Ratio</th> {/* Added W/L Ratio column */}
              <th>Elo Rating</th>
            </tr>
          </thead>
          <tbody>
            {scores.length > 0 ? (
              scores.map(score => {
                const wins = score.wins || 0; // Fetch wins from Firestore
                const losses = score.losses || 0; // Fetch losses from Firestore
                const ratio = losses === 0 ? (wins > 0 ? 'Infinity' : 'N/A') : (wins / losses).toFixed(2); // W/L Ratio calculation

                return (
                  <tr key={score.id}>
                    <td>{score.id}</td>
                    <td>{wins}</td>
                    <td>{losses}</td>
                    <td>{ratio}</td> {/* Display W/L Ratio */}
                    <td>{score.elo !== undefined ? score.elo : 'N/A'}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5">No scores available</td> {/* Adjusted colspan to 5 for W/L Ratio */}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
