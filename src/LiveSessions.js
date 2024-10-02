import React, { useEffect, useState } from "react";
import { FIREBASE_STORE, FIREBASE_DB } from "./firebase"; // Firebase configuration import
import { ref, onValue } from "firebase/database";
import './LiveSessions.css'; // CSS file
import OrlandoPB from './assets/orlandopb.png';

export default function LiveSessions() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [hitOutdoor, setHitOutdoor] = useState(0);
  const [hitIndoor, setHitIndoor] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeGames, setActiveGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const activeUsersRef = ref(FIREBASE_DB, 'activeUsers');
    const hitOutdoorRef = ref(FIREBASE_DB, 'hitOutdoor');
    const hitIndoorRef = ref(FIREBASE_DB, 'hitIndoor');

    const unsubscribeActive = onValue(activeUsersRef, (snapshot) => {
      setActiveUsers(snapshot.size);
    });

    const unsubscribeOutdoorHits = onValue(hitOutdoorRef, (snapshot) => {
      setHitOutdoor(snapshot.val() || 0);
    });

    const unsubscribeIndoorHits = onValue(hitIndoorRef, (snapshot) => {
      setHitIndoor(snapshot.val() || 0);
    });

    return () => {
      unsubscribeActive();
      unsubscribeOutdoorHits();
      unsubscribeIndoorHits();
    };
  }, []);

  // Fetch active games for the selected location
  const fetchActiveGames = (location) => {
    // Replace with your own Firebase query for active games
    const activeGamesRef = ref(FIREBASE_DB, `locations/${location}/activeGames`);
    onValue(activeGamesRef, (snapshot) => {
      const games = snapshot.val() || [];
      setActiveGames(games);
    });
  };

  // Fetch leaderboard for the selected location
  const fetchLeaderboard = (location) => {
    // Replace with your own Firebase query for the leaderboard
    const leaderboardRef = ref(FIREBASE_DB, `locations/${location}/leaderboard`);
    onValue(leaderboardRef, (snapshot) => {
      const leaderboardData = snapshot.val() || [];
      setLeaderboard(leaderboardData);
    });
  };

  // Handle when a location box is clicked
  const handleLocationClick = (location) => {
    setSelectedLocation(location); // Set the selected location
    fetchActiveGames(location);    // Fetch active games for that location
    fetchLeaderboard(location);    // Fetch leaderboard for that location
  };

  // Reset the view to show locations instead of games/leaderboard
  const handleBackToLocations = () => {
    setSelectedLocation(null);
    setActiveGames([]);
    setLeaderboard([]);
  };

  return (
    <div className="live-sessions">
      <h1>Live Sessions</h1>

      {selectedLocation ? (
        <div className="location-details">
          <button onClick={handleBackToLocations}>Back to Locations</button>

          <h2>Active Games at {selectedLocation}</h2>
          {activeGames.length > 0 ? (
            <ul>
              {activeGames.map((game, index) => (
                <li key={index}>{game}</li>
              ))}
            </ul>
          ) : (
            <p>No active games.</p>
          )}

          <h2>Leaderboard at {selectedLocation}</h2>
          {leaderboard.length > 0 ? (
            <ul>
              {leaderboard.map((player, index) => (
                <li key={index}>{player.name}: {player.score} points</li>
              ))}
            </ul>
          ) : (
            <p>No leaderboard data available.</p>
          )}
        </div>
      ) : (
        <div className="live-sessions-container">
          {/* Unverified Orlando Paintball */}
          <div className="location-box" onClick={() => handleLocationClick('Orlando Paintball')}>
            <div className="logo-container">
              <img src={OrlandoPB} alt="Orlando Paintball Logo" className="logopb" />
            </div>
            <div className="location-info">
              <h2>Orlando Paintball</h2>
              <div className="verification-box unverified">
                <span className="checkmark">✔</span> Unverified
              </div>
            </div>
          </div>

          {/* Verified Example (commented out) */}
          {/* <div className="location-box" onClick={() => handleLocationClick('Another Arena')}>
            <div className="logo-container">
              <img src={OrlandoPB} alt="Another Paintball Logo" className="logopb" />
            </div>
            <div className="location-info">
              <h2>Another Paintball Arena</h2>
              <div className="verification-box verified">
                <span className="checkmark">✔</span> Verified
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
