import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FIREBASE_AUTH } from './firebase'; 
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import Firebase Functions
import CrosspointxLogo from './assets/Crosspointx.svg';
import './Login.css';


// Define RefereeID and RefereePass
const refereeID = '8155180126';
const refereePass = '786592';

const Login = ({ setIsReferee }) => { 
  const [isRefereeLogin, setIsRefereeLogin] = useState(false); // Referee or regular user login state
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();
  const functions = getFunctions(); // Initialize Firebase Functions

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let emailToUse = identifier;
      let passwordToUse = password;

      // If logging in as a referee
      if (identifier === refereeID) {
        emailToUse = `${refereeID}@ref.com`;
        passwordToUse = refereePass;
        
        setIsReferee(true);

        // Login the referee
        const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, emailToUse, passwordToUse);
        const user = userCredential.user;

        // Call Firebase Cloud Function to set referee claim
        const setRefereeClaim = httpsCallable(functions, 'setRefereeClaim');
        await setRefereeClaim({ uid: user.uid });

        // Navigate to the Leaderboard after setting the claim
        navigate('/Leaderboard');
      } else {
        setIsReferee(false);

        // Regular user login
        const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, emailToUse, passwordToUse);
        navigate('/Leaderboard');
      }
    } catch (error) {
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginContainer">
      <img src={CrosspointxLogo} alt="Logo" className="Logo" />
      <h1 className="LoginTitle">Login</h1>
      <div className="LoginToggleContainer">
        <button className={`LoginToggleButton ${!isRefereeLogin ? 'active-toggle' : ''}`} onClick={() => setIsRefereeLogin(false)}> User </button>
        <button className={`LoginToggleButton ${isRefereeLogin ? 'active-toggle' : ''}`} onClick={() => setIsRefereeLogin(true)}> Ref </button>
      </div>
      <input className="LoginInput" type="text" placeholder={isRefereeLogin ? 'Ref ID' : 'Email'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
      <input className="LoginInput" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {error && <div className="LoginErrorMessage">{error}</div>}

      {loading ? ( <div className="Loading">Loading...</div> ) : (
        <button className="button" onClick={handleLogin}> Login </button>
      )}

      <div className="SignupLink"> 
        <Link to={isRefereeLogin ? '/refsignup' : '/signup'} className="LinkText">
          {isRefereeLogin ? 'Signup as Referee' : "Don't have an account? Sign up here"} 
        </Link>
      </div>
    </div>
  );
};

export default Login;