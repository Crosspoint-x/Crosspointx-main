import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase.js'; // Ensure this is your Firestore instance

// Function to listen for live sessions
function listenForLiveSessions(setActiveSessions) {
  const sessionsRef = collection(FIREBASE_DB, 'sessions');
  const liveSessionsQuery = query(sessionsRef, where('active', '==', true));

  // Listen for real-time updates on active sessions
  const unsubscribe = onSnapshot(liveSessionsQuery, (snapshot) => {
    const activeSessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setActiveSessions(activeSessions); // Update state with active sessions
  });

  return unsubscribe; // Unsubscribe when no longer needed
}

function LiveSessions() {
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    const unsubscribe = listenForLiveSessions(setActiveSessions);

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  return (
    <div>
      <h3>Live Sessions</h3>
      {activeSessions.length > 0 ? (
        <ul>
          {activeSessions.map((session) => (
            <li key={session.id}>
              <strong>Session ID:</strong> {session.id} <br />
              <strong>User ID:</strong> {session.userId} <br />
              <strong>Start Time:</strong>{' '}
              {session.startTime ? session.startTime.toDate().toLocaleString() : 'N/A'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No active sessions.</p>
      )}
    </div>
  );
}

export default LiveSessions;
