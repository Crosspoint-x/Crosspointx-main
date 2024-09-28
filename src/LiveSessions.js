import React, { useEffect, useState } from "react";
import { FIREBASE_STORE, FIREBASE_DB } from "./firebase"; // Firebase configuration import
import { ref, push, onValue, onDisconnect, set, remove } from "firebase/database";
import './LiveSessions.css'; // CSS file
import OrlandoPB from './assets/orlandopb.png';

export default function LiveSessions() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [hitOutdoor, setHitOutdoor] = useState(0);
  const [hitIndoor, setHitIndoor] = useState(0);

  useEffect(() => {
    const activeUsersRef = ref(FIREBASE_DB, 'activeUsers');
    const hitOutdoorRef = ref(FIREBASE_DB, 'hitOutdoor');
    const hitIndoorRef = ref(FIREBASE_DB, 'hitIndoor');

    const userRef = push(activeUsersRef);
    set(userRef, true);

    onDisconnect(userRef).remove();

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
      remove(userRef);
      unsubscribeActive();
      unsubscribeOutdoorHits();
      unsubscribeIndoorHits();
    };
  }, []);

  return (
    <div className="live-sessions">
      <h1>Live Sessions</h1>
      <div className="live-sessions-container">
        <div className="logo-container">
          <img src={OrlandoPB} alt="Logo" className="logopb" />
        </div>
        <div className="game-stats">
          <h2>Games:</h2>
          <p>Outdoor Active: {activeUsers} | Hit: {hitOutdoor}</p>
          <p>Indoor Active: {activeUsers} | Hit: {hitIndoor}</p>
        </div>
      </div>
    </div>
  );
}
