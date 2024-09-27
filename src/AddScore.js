import React, { useState } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase'; // Assuming your Firebase config is in this file
import './AddScore.css'; // New CSS file for styling this form

const AddScore = () => {
  const [playerID, setPlayerID] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Function to add score to Firebase
  const handleAddScore = async (e) => {
    e.preventDefault();

    if (!playerID || !score) {
      setError('Please enter both player name and score.');
      return;
    }

    try {
      const scoresCollection = collection(FIREBASE_DB, 'scores');
      const newScoreDoc = doc(scoresCollection); // Automatically generate a new document ID
      await setDoc(newScoreDoc, {
        exact: { user: playerID, score: parseInt(score, 10) },
      });

      // Reset form and show success message
      setPlayerID('');
      setScore('');
      setError('');
      setSuccessMessage('Score added successfully!');
    } catch (err) {
      console.error('Error adding score:', err);
      setError('Failed to add score. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Add a New Score</h1>
      <form onSubmit={handleAddScore} className="add-score-form">
        <div className="form-group">
          <label htmlFor="playerID">Player Name</label>
          <input
            type="text"
            id="playerID"
            value={playerID}
            onChange={(e) => setPlayerID(e.target.value)}
            placeholder="Enter player name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="score">Score</label>
          <input
            type="number"
            id="score"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter player score"
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <button type="submit" className="button">Add Score</button>
      </form>
    </div>
  );
};

export default AddScore;

//css 
.container {
    width: 90%;
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-align: center;
  }
  
  h1 {
    color: #333;
    margin-bottom: 20px;
  }
  
  form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    width: 100%;
    box-sizing: border-box;
  }
  
  .button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .button:hover {
    background-color: #0056b3;
  }
  
  .error {
    color: red;
  }
  
  .success {
    color: green;
  }
  