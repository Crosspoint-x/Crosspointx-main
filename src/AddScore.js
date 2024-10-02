import React, { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { FIREBASE_DB } from './firebase'; // Firebase Realtime DB config
import './AddScore.css';

const AddScore = ({ locationId }) => {
  const [activePlayers, setActivePlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [gameResult, setGameResult] = useState('');

  useEffect(() => {
    const activePlayersRef = ref(FIREBASE_DB, `locations/${locationId}/activePlayers`);

    // Fetch active players for the current game
    onValue(activePlayersRef, (snapshot) => {
      const playersData = snapshot.val() || {};
      setActivePlayers(Object.values(playersData));
    });
  }, [locationId]);

  const handleTeamAssignment = (playerId, team) => {
    if (team === 'A') {
      setTeamA([...teamA, playerId]);
      setTeamB(teamB.filter((id) => id !== playerId)); // Remove from Team B if present
    } else {
      setTeamB([...teamB, playerId]);
      setTeamA(teamA.filter((id) => id !== playerId)); // Remove from Team A if present
    }
  };

  const handleGameResult = async (winningTeam) => {
    const winningTeamRef = ref(FIREBASE_DB, `locations/${locationId}/currentGame/${winningTeam}`);
    const losingTeam = winningTeam === 'teamA' ? 'teamB' : 'teamA';

    // Update wins for all players in the winning team
    teamA.forEach(async (playerId) => {
      const playerRef = ref(FIREBASE_DB, `locations/${locationId}/currentGame/teamA/${playerId}`);
      await set(playerRef, {
        wins: 1, // Increment their wins (or calculate based on previous value)
      });
    });

    // Set game result
    setGameResult(`Team ${winningTeam === 'teamA' ? 'A' : 'B'} wins!`);
  };

  return (
    <div className="add-score-container">
      <h2>Assign Players to Teams</h2>
      <div className="active-players">
        {activePlayers.map((player) => (
          <div key={player.userId}>
            <p>{player.name}</p>
            <button onClick={() => handleTeamAssignment(player.userId, 'A')}>Add to Team A</button>
            <button onClick={() => handleTeamAssignment(player.userId, 'B')}>Add to Team B</button>
          </div>
        ))}
      </div>

      <h2>Game Result</h2>
      <button onClick={() => handleGameResult('teamA')}>Team A Wins</button>
      <button onClick={() => handleGameResult('teamB')}>Team B Wins</button>
      {gameResult && <p>{gameResult}</p>}
    </div>
  );
};

export default AddScore;
