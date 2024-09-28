import React, { useState } from 'react'; // Correct import without setError
import { useNavigate, Link } from 'react-router-dom';
import { FIREBASE_AUTH } from './firebase'; // Firebase config
import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase auth methods
import './Login.css';
import CrosspointxLogo from './assets/Crosspointx.svg';

const refID = '8155180126';
const refPass = '786592'; 

const Login = () => {
  const [isRefLogin, setIsRefLogin] = useState(false); // Toggle between User and Ref login
  const [identifier, setIdentifier] = useState(''); // Identifier is email or ref ID
  const [password, setPassword] = useState(''); // Password for login
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Properly define setError as part of the state
  const navigate = useNavigate(); // React Router navigation

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null); // Use setError defined by useState

    try {
      let emailToUse = identifier;
      let passwordToUse = password;

      // If the refID is part of the email, automatically use the refPass
      if (identifier === refID) {
        emailToUse = `${refID}@ref.com`;
        passwordToUse = refPass;
      }

      const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, emailToUse, passwordToUse);
      const user = userCredential.user;

      // Navigate to a different page or perform additional actions on successful login
      navigate('/dashboard');
    } catch (error) {
      setError(`Login failed: ${error.message}`); // Correct usage of setError
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <img src={CrosspointxLogo} alt="Logo" className="logo" />
      <h1 className="title">Login</h1>

      {/* Toggle for User and Ref login */}
      <div className="toggle-container">
        <button
          className={`toggle-button ${!isRefLogin ? 'active-toggle' : ''}`}
          onClick={() => setIsRefLogin(false)}
        >
          User
        </button>
        <button
          className={`toggle-button ${isRefLogin ? 'active-toggle' : ''}`}
          onClick={() => setIsRefLogin(true)}
        >
          Ref
        </button>
      </div>

      {/* Input for email (or ref ID) */}
      <input
        className="input"
        type="text"
        placeholder={isRefLogin ? 'Ref ID' : 'Email'}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      {/* Input for password */}
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Display error message if exists */}
      {error && <div className="error-message">{error}</div>}

      {/* Show loader when logging in */}
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <button className="button" onClick={handleLogin}>
          Login
        </button>
      )}

      {/* Signup link (changes depending on the login type) */}
      <div className="signup-link">
        <Link to={isRefLogin ? '/refsignup' : '/signup'} className="link-text">
          {isRefLogin ? 'Sign up as Referee' : "Don't have an account? Sign up here"}
        </Link>
      </div>
    </div>
  );
};

export default Login;
