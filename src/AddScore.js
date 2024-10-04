import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FIREBASE_STORE } from './firebase'; // Firestore config
import './AddScore.css';

const AddScore = ({ locationId }) => {
  const [activePlayers, setActivePlayers] = useState([]);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [gameResult, setGameResult] = useState('');
  const [inputPlayer, setInputPlayer] = useState(''); // Text input for adding player

  useEffect(() => {
    if (!locationId) {
      console.error("Invalid locationId: ", locationId);
      return; // If locationId is undefined, exit early
    }

    const activePlayersRef = doc(FIREBASE_STORE, `locations/${locationId}/activePlayers`);
    const teamsRef = doc(FIREBASE_STORE, `locations/${locationId}/teams`);

    // Load active players from Firestore
    const unsubscribePlayers = onSnapshot(activePlayersRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const playersData = docSnapshot.data();
        setActivePlayers(Object.values(playersData || {}));
      }
    });

    // Load team assignments from Firestore
    const unsubscribeTeams = onSnapshot(teamsRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const { teamA: savedTeamA = [], teamB: savedTeamB = [] } = docSnapshot.data();
        setTeamA(savedTeamA);
        setTeamB(savedTeamB);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeTeams();
    };
  }, [locationId]);

  const handleTeamAssignment = async (playerId, team) => {
    if (team === 'A') {
      if (teamA.length < 5) {
        setTeamA([...teamA, playerId]);
        setTeamB(teamB.filter((id) => id !== playerId));
      }
    } else {
      if (teamB.length < 5) {
        setTeamB([...teamB, playerId]);
        setTeamA(teamA.filter((id) => id !== playerId));
      }
    }

    // Persist the updated teams to Firestore
    const teamsRef = doc(FIREBASE_STORE, `locations/${locationId}/teams`);
    await setDoc(teamsRef, { teamA, teamB }, { merge: true });
  };

  const handleGameResult = async (winningTeam) => {
    if (!locationId) {
      console.error("Invalid locationId for game result: ", locationId);
      return; // If locationId is undefined, exit early
    }

    const currentGameRef = doc(FIREBASE_STORE, `locations/${locationId}/currentGame`);
    const losingTeam = winningTeam === 'teamA' ? 'teamB' : 'teamA';

    // Update the game result for each team
    const gameData = {
      teamA: teamA.map(playerId => ({ playerId, wins: 1 })),
      teamB: teamB.map(playerId => ({ playerId, wins: 0 })),
    };

    try {
      await setDoc(currentGameRef, gameData, { merge: true });
      setGameResult(`Team ${winningTeam === 'teamA' ? 'A' : 'B'} wins!`);
    } catch (error) {
      console.error("Error updating game result:", error);
    }
  };

  const handleAddPlayer = async () => {
    if (!inputPlayer) return;

    if (!locationId) {
      console.error("Invalid locationId for adding player: ", locationId);
      return; // If locationId is undefined, exit early
    }

    const activePlayersRef = doc(FIREBASE_STORE, `locations/${locationId}/activePlayers`);
    const player = { userId: inputPlayer, name: inputPlayer }; // Assuming player name and ID are the same

    try {
      // Automatically add player to Firestore
      const activePlayersDoc = await getDoc(activePlayersRef);
      if (activePlayersDoc.exists()) {
        const existingPlayers = activePlayersDoc.data();
        await updateDoc(activePlayersRef, {
          [inputPlayer]: player,
        });
      } else {
        await setDoc(activePlayersRef, {
          [inputPlayer]: player,
        });
      }

      setActivePlayers((prevPlayers) => [...prevPlayers, player]);
      setInputPlayer(''); // Clear input after adding
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  return (
    <div className="add-score-container">
      <h2>Assign Players to Teams</h2>

      {/* Unassigned Players with Text Box */}
      <div className="unassigned-players">
        <h3>Unassigned Players</h3>

        {/* Input to add player manually */}
        <input
          type="text"
          value={inputPlayer}
          onChange={(e) => setInputPlayer(e.target.value)}
          placeholder="Enter player name"
        />
        <button onClick={handleAddPlayer}>Add Player</button>

        {activePlayers
          .filter((player) => !teamA.includes(player.userId) && !teamB.includes(player.userId))
          .map((player) => (
            <div key={player.userId}>
              <p>{player.name}</p>
              <button onClick={() => handleTeamAssignment(player.userId, 'A')}>Add to Team A</button>
              <button onClick={() => handleTeamAssignment(player.userId, 'B')}>Add to Team B</button>
            </div>
          ))}
      </div>

      {/* Team A */}
      <div className="team-section">
        <h3>Team A (Max 5 players)</h3>
        {teamA.map((playerId) => (
          <p key={playerId}>{playerId}</p>
        ))}
      </div>

      {/* Team B */}
      <div className="team-section">
        <h3>Team B (Max 5 players)</h3>
        {teamB.map((playerId) => (
          <p key={playerId}>{playerId}</p>
        ))}
      </div>

      {/* Game Result */}
      <h2>Game Result</h2>
      <button onClick={() => handleGameResult('teamA')}>Team A Wins</button>
      <button onClick={() => handleGameResult('teamB')}>Team B Wins</button>
      {gameResult && <p>{gameResult}</p>}
    </div>
  );
};

export default AddScore;
