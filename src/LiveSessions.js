import React, { useEffect, useState } from "react";
import { FIREBASE_STORE } from "./firebase"; 
import { ref, push, onValue, onDisconnect, set, remove } from "firebase/database";
import './LiveSessions.css'; // Import the CSS for styling

export default function LiveSessions() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [outdoorActive, setOutdoorActive] = useState(0);
  const [indoorActive, setIndoorActive] = useState(0);
  const [outdoorHits, setOutdoorHits] = useState(0);
  const [indoorHits, setIndoorHits] = useState(0);

  useEffect(() => {
    // Reference to the active users
    const activeUsersRef = ref(FIREBASE_STORE, 'activeUsers');

    // Add the user to the active users list when they come online
    const userRef = push(activeUsersRef);
    set(userRef, true); // Set the user as active before handling disconnection

    // Remove the user when they disconnect
    onDisconnect(userRef).remove(); 

    // Listen for changes in the active users list
    const unsubscribeActiveUsers = onValue(activeUsersRef, (snapshot) => {
      setActiveUsers(snapshot.size); // Update the number of active users
    });

    // Listen for outdoor active players and hits
    const outdoorActiveRef = ref(FIREBASE_STORE, 'games/outdoor/active');
    const unsubscribeOutdoorActive = onValue(outdoorActiveRef, (snapshot) => {
      setOutdoorActive(snapshot.val() || 0); // Set outdoor active players
    });

    const outdoorHitsRef = ref(FIREBASE_STORE, 'games/outdoor/hits');
    const unsubscribeOutdoorHits = onValue(outdoorHitsRef, (snapshot) => {
      setOutdoorHits(snapshot.val() || 0); // Set outdoor hits
    });

    // Listen for indoor active players and hits
    const indoorActiveRef = ref(FIREBASE_STORE, 'games/indoor/active');
    const unsubscribeIndoorActive = onValue(indoorActiveRef, (snapshot) => {
      setIndoorActive(snapshot.val() || 0); // Set indoor active players
    });

    const indoorHitsRef = ref(FIREBASE_STORE, 'games/indoor/hits');
    const unsubscribeIndoorHits = onValue(indoorHitsRef, (snapshot) => {
      setIndoorHits(snapshot.val() || 0); // Set indoor hits
    });

    // Cleanup on component unmount
    return () => {
      remove(userRef); // Ensure user is removed when component unmounts
      unsubscribeActiveUsers(); // Unsubscribe from active users
      unsubscribeOutdoorActive(); // Unsubscribe from outdoor active
      unsubscribeOutdoorHits(); // Unsubscribe from outdoor hits
      unsubscribeIndoorActive(); // Unsubscribe from indoor active
      unsubscribeIndoorHits(); // Unsubscribe from indoor hits
    };
  }, []);

  return (
    <div className="live-sessions-container">
      <h1 className="live-sessions-title">Live Sessions</h1> {/* Moved here */}
      <div className="games-info">
        <img className="logo" src="/assets/OrlandoPB.png" alt="Orlando Paintball Logo" />
        <div className="games-status">
          <h2>Games:</h2>
          <div className="game-details">
            <div className="outdoor-status">
              <span>Outdoor Active: {outdoorActive}</span>
              <span>Hit: {outdoorHits}</span>
            </div>
            <div className="indoor-status">
              <span>Indoor Active: {indoorActive}</span>
              <span>Hit: {indoorHits}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
