import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase'; 
import './Leaderboard.css';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return React.createElement('div', null, 'Loading...');
  }

  return React.createElement('div', { className: 'container' },
    React.createElement('h1', null, 'Leaderboard'),
    React.createElement('table', { className: 'table' },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', null, 'Player'),
          React.createElement('th', null, 'Score')
        )
      ),
      React.createElement('tbody', null,
        scores.length > 0 ? (
          scores.map(score => 
            React.createElement('tr', { key: score.id },
              React.createElement('td', null, score.exact?.user || 'Unknown Player'),
              React.createElement('td', null, score.exact?.score || 'No Score')
            )
          )
        ) : (
          React.createElement('tr', null,
            React.createElement('td', { colSpan: '2' }, 'No scores available')
          )
        )
      )
    )
  );
};

export default Leaderboard;
