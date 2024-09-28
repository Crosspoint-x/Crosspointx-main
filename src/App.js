import React, { useEffect, useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';      
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Login from './Login';
import SignUp from "./SignUp";
import QRCodeDisplay from './QRCodeDisplay';
import Leaderboard from './Leaderboard'; 
import { FIREBASE_AUTH } from "./firebase";
import './App.css';
import LiveSessions from './LiveSessions';
import AddScore from './AddScore';
import { getDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from './firebase';

const stripePromise = loadStripe('pk_test_51Ow7goA466XWtdBiQakYrdadPmlpib7w6yeXTIxqo7enudMMl2Y5uEdGRGlmTOsChS5Jl0M1nkTiuCEbUZ8CgfTL00Y1tOYYMu');

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/Login" />;
  }
  return children;
};

function ProtectedRefRoute({ children, user }) {
  const [isReferee, setIsReferee] = useState(false);

  useEffect(() => {
    const checkRefereeStatus = async () => {
      try {
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
  }, [user]);

  if (!user) {
    return <Navigate to="/Login" />;
  }

  if (!isReferee) {
    return <div>Access Denied. Only referees can access this page.</div>;
  }

  return children;
}

// Main App component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("User state changed:", user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="root">
      <Router>
        <Elements stripe={stripePromise}>
          <Routes>
            <Route path="/Login" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route 
              path="*" 
              element={<ProtectedRoute user={user}><InsideLayout user={user} /></ProtectedRoute>} 
            />
            <Route path="*" element={<Navigate to={user ? "/Leaderboard" : "/Login"} />} />
          </Routes>
        </Elements>
      </Router>
    </div>
  );
}

// InsideLayout component for nested routes and bottom navigation
function InsideLayout({ user }) {
  const [value, setValue] = useState('/LiveSessions'); // Set the initial state to the first page
  const navigate = useNavigate();

  const handleNavigationChange = (event, newValue) => {
    setValue(newValue);
    navigate(newValue); // Navigate to the selected route
  };

  const handleLogout = () => {
    FIREBASE_AUTH.signOut().then(() => {
      navigate('/Login');
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  useEffect(() => {
    // Update the selected value based on the current path
    const currentPath = window.location.pathname;
    setValue(currentPath);
  }, [user]); // Trigger the effect when user changes

  return (
    <div className="InsideLayout">
      {/* Back and Logout buttons */}
      <div className="Back">
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
      </div>
      <div className="Logout">
        <IconButton onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </div>

      {/* Routes for rendering actual components */}
      <div className="content">
        <Routes>
          <Route path="/LiveSessions" element={<LiveSessions />} />
          <Route path="/Leaderboard" element={<Leaderboard />} /> 
          <Route path="/qr-code" element={<QRCodeDisplay />} />
          <Route path="/add-score" element={ <ProtectedRefRoute user={user}><AddScore />
    </ProtectedRefRoute>
  }
/>
        </Routes>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation
        value={value}
        onChange={handleNavigationChange}
        showLabels    
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <BottomNavigationAction label="LiveSessions" value="/LiveSessions" icon={<SatelliteAltIcon />} />
        <BottomNavigationAction label="Leaderboard" value="/Leaderboard" icon={<LeaderboardIcon />} />
        <BottomNavigationAction label="QR Code" value="/qr-code" icon={<QrCodeIcon />} />
        <BottomNavigationAction label="Add Score" value="/add-score" icon={<QrCodeIcon />} />
      </BottomNavigation>
    </div>
  );
}
              