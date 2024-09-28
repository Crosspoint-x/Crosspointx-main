      import React, { useState } from 'react';
      import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
      import { FIREBASE_AUTH } from './firebase'; // Firebase config
      import { signInWithEmailAndPassword } from 'firebase/auth'; // Firebase auth methods
      import './Login.css'; // Create a CSS file for styling
      import './App'; // Import main styles
      import CrosspointxLogo from './assets/Crosspointx.svg';

      const Login = () => {
        const [isRefLogin, setIsRefLogin] = useState(false); // Toggle between User and Ref login
        const [identifier, setIdentifier] = useState(''); // Identifier is email or ref ID
        const [password, setPassword] = useState(''); // Password for login
        const [loading, setLoading] = useState(false); // Loading state
        const navigate = useNavigate(); // React Router navigation

        const handleLogin = async () => {
          // Check if identifier (email/ref) and password are filled in
          if (!identifier || !password) {
            alert('Please fill in all fields.');
            return;
          }

          setLoading(true); // Set loading state

          try {
            // If it's a Ref login, construct email as `RefID@ref.com`
            const email = isRefLogin ? `${identifier}@ref.com` : identifier;
            
            // Firebase sign-in function
            await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
            
            // On successful login
            alert('Logged in successfully!');
            
            // Redirect to the main screen (adjust route accordingly)
            navigate('/List');
            
          } catch (error) {
            // Handle login error
            console.error('Login error:', error);
            alert('Invalid credentials. Please try again.');
          } finally {
            // Stop loading state
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
