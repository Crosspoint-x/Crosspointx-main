// Leaderboard.js
import React, { useState, useEffect } from 'react';
import { collection, doc, runTransaction, getDocs, query, where } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase.js'; // Assume this is your custom Firebase export
import './Leaderboard.css';

// Function to update the leaderboard table in the DOM (optional use if you want DOM manipulation)
function updateLeaderboardTable(players) {
  const tableBody = document.querySelector('#leaderboard-table tbody');
  tableBody.innerHTML = ''; // Clear existing rows

  players.forEach(player => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.user}</td>
      <td>${player.score}</td>
    `;
    tableBody.appendChild(row); // Append new row to the table body
  });
}

// Leaderboard object with Firebase logic
const Leaderboard = {
  // Function to create a new score for a player
  async createScore(playerID, score) {
    const MAX_RECURSION_DEPTH = 10;

    function bucket(value, min, max) {
      const bucketSize = Math.max((max - min) / 3, 1);
      const bucketMin = Math.floor(value / bucketSize) * bucketSize;
      const bucketMax = Math.min(bucketMin + bucketSize, max);
      return { min: bucketMin, max: bucketMax };
    }

    async function writeScoreToCollection(
      id, value, coll, range, transaction, pendingWrites, depth = 0
    ) {
      if (depth > MAX_RECURSION_DEPTH) {
        throw new Error("Maximum recursion depth exceeded");
      }

      const snapshot = await getDocs(coll);
      if (snapshot.empty) {
        for (const write of pendingWrites) {
          write(transaction);
        }
        const docRef = doc(coll);
        transaction.set(docRef, { exact: { score: value, user: id } });
        return;
      }

      const min = range.min;
      const max = range.max;

      for (const node of snapshot.docs) {
        const data = node.data();
        if (data.exact !== undefined) {
          const newRange = bucket(value, min, max);
          const tempRange = bucket(data.exact.score, min, max);

          if (newRange.min === tempRange.min && newRange.max === tempRange.max) {
            const rangeData = { range: newRange, count: 2 };
            for (const write of pendingWrites) {
              write(transaction);
            }
            const docRef = node.ref;
            transaction.set(docRef, rangeData);
            transaction.set(doc(collection(docRef, 'scores')), data);
            transaction.set(doc(collection(docRef, 'scores')), { exact: { score: value, user: id } });
            return;
          } else {
            continue;
          }
        }

        if (data.range.min <= value && data.range.max > value) {
          const docRef = node.ref;
          const newCount = node.get("count") + 1;
          pendingWrites.push((t) => t.update(docRef, { count: newCount }));

          const newRange = bucket(value, min, max);
          return writeScoreToCollection(id, value, collection(docRef, 'scores'), newRange, transaction, pendingWrites, depth + 1);
        }
      }

      transaction.set(doc(coll), { exact: { score: value, user: id } });
    }

    const scores = collection(FIREBASE_DB, 'scores');
    const players = collection(FIREBASE_DB, 'players');

    return runTransaction(FIREBASE_DB, async (transaction) => {
      const playerRef = doc(players, playerID);
      const existingPlayerSnapshot = await transaction.get(playerRef);

      if (existingPlayerSnapshot.exists()) {
        const existingScore = existingPlayerSnapshot.data().score;
        await writeScoreToCollection(playerID, score, scores, { min: 0, max: 1000 }, transaction, []);
        transaction.update(playerRef, { score: score });
      } else {
        await writeScoreToCollection(playerID, score, scores, { min: 0, max: 1000 }, transaction, []);
        transaction.set(playerRef, { user: playerID, score: score });
      }
    });
  },

  // Function to read the rank of a player
  async readRank(playerID) {
    const playersQuery = query(collection(FIREBASE_DB, 'players'), where('user', '==', playerID));
    const players = await getDocs(playersQuery);

    if (players.empty) {
      throw new Error(`Player not found in leaderboard: ${playerID}`);
    }

    if (players.size > 1) {
      console.warn(`Multiple scores with player ${playerID}, fetching first`);
    }

    const player = players.docs[0].data();
    const score = player.score;

    const scores = collection(FIREBASE_DB, 'scores');

    async function findPlayerScoreInCollection(id, value, coll, currentCount) {
      const snapshot = await getDocs(coll);

      for (const doc of snapshot.docs) {
        const exact = doc.data().exact;

        if (exact) {
          if (exact.score === value && exact.user === id) {
            return currentCount + 1;
          } else if (exact.score > value) {
            currentCount++;
          }
          continue;
        }

        const range = doc.data().range;
        const count = doc.get("count");

        if (range.min > value) {
          currentCount += count;
          continue;
        } else if (range.max <= value) {
          continue;
        } else {
          const subcollection = collection(doc.ref, 'scores');
          return findPlayerScoreInCollection(id, value, subcollection, currentCount);
        }
      }

      throw new Error(`Range not found for score: ${value}`);
    }

    const rank = await findPlayerScoreInCollection(playerID, score, scores, 0);
    return { user: playerID, rank: rank, score: score };
  }
};

// React component to display the leaderboard
const LeaderboardComponent = () => {
  const [players, setPlayers] = useState([]);

  // Fetch players data from Firestore
  useEffect(() => {
    (async () => {
      const playersQuery = collection(FIREBASE_DB, 'players');
      console.log(1);
      // const playerDocs = await getDocs(playersQuery);
      // console.log(2);
      // const fetchedPlayers = playerDocs.docs.map(doc => doc.data());
      // console.log(3);
      setPlayers(fetchedPlayers);
    })();
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index}>
              <td>{player.user}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Leaderboard, LeaderboardComponent }; // Export both the object and the component
