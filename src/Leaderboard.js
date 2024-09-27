import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase'; // Assuming your Firebase export file
import './Leaderboard.css';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the leaderboard data from Firebase
  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        const scoresCollection = collection(FIREBASE_DB, 'scores');
        const scoreSnapshot = await getDocs(scoresCollection);
        const scoreList = scoreSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setScores(scoreList);
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.length > 0 ? (
            scores.map(score => (
              <tr key={score.id}>
                <td>{score.exact?.user || 'Unknown Player'}</td>
                <td>{score.exact?.score || 'No Score'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No scores available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;

