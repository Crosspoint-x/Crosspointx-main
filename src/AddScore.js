import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, updateDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB, FIREBASE_AUTH } from './firebase';
import './AddScore.css';

const AddScore = () => {
  const [teamAPlayerID, setTeamAPlayerID] = useState('');
  const [teamBPlayerID, setTeamBPlayerID] = useState('');
  const [outcome, setOutcome] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isReferee, setIsReferee] = useState(false);

  useEffect(() => {
    const checkRefereeStatus = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().isReferee) {
            setIsReferee(true);
          } else {
            setIsReferee(false);
          }
        }
      } catch (error) {
        console.error('Error checking referee status:', error);
        setIsReferee(false);
      }
    };
  
    checkRefereeStatus();
  }, []);
  

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!isReferee) {
      setError('Access denied. Only referees can add scores.');
      return;
    }

    if (!teamAPlayerID || !teamBPlayerID || !outcome) {
      setError('Please enter player IDs for both teams and select an outcome.');
      return;
    }

    try {
      // Existing code to add scores goes here
      // ...

      setSuccessMessage('Score updated successfully!');
    } catch (err) {
      setError('Failed to update score. Please try again.');
    }
  };

  return isReferee ? (
    <div className="add-score-container">
      <h2>Add Match Result</h2>
      <form className="add-score-form" onSubmit={handleAddScore}>
        {/* Form fields for adding match results */}
      </form>
    </div>
  ) : (
    <div className="error">Access Denied. You are not a referee.</div>
  );
};

export default AddScore;
