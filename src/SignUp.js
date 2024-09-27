import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_APP, FIREBASE_STORE } from './firebase'; 
import { loadStripe } from '@stripe/stripe-js'; 
import { getStripePayments } from '@invertase/firestore-stripe-payments';
import './SignUp.css';   
import { collection, doc, addDoc, onSnapshot } from "firebase/firestore"; 
import { useNavigate } from 'react-router-dom'; // Import to handle navigation
import IconButton from "@mui/material/IconButton"; // Import for back button
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import for back icon

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_51Ow7goA466XWtdBifnrLrOBoMOu6VGECzCQMuMvB5faDbWBClqqQHRMoF1aXEPQVQiDX17j3gbtBtU2wmjdl7rPd002dR4kDFT');

const payments = getStripePayments(FIREBASE_APP, {
  firestore: FIREBASE_STORE,
  productsCollection: "products",
  customersCollection: "customers",
});

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate(); // For back button functionality

  // Subscription details
  const subscriptionCost = 5.99;
  const taxRate = 0.07;
  const totalCost = (subscriptionCost * (1 + taxRate)).toFixed(2);

  // Handle form submission and payment
  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      const checkoutSessionsCollection = collection(FIREBASE_STORE, "customers", user.uid, "checkout_sessions");

      const docRef = await addDoc(checkoutSessionsCollection, {
        price: "price_1Q3HpvA466XWtdBipaKVaTaV",
        success_url: `${window.location.origin}/payments/success`,
        cancel_url: `${window.location.origin}/payments/cancel`,
      });

      const unsubscribe = onSnapshot(docRef, (snap) => {
        const { error, url } = snap.data();
        if (error) {
          alert(`An error occurred: ${error.message}`);
          setLoading(false);
        }
        if (url) {
          setRedirecting(true);
          window.location.assign(url);
        }
      });

    } catch (error) {
      setError(`Error during sign-up or payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="sign-up-container">
      {/* Back Button in Upper Right Corner */}
      <div className="back-button-container">
        <IconButton onClick={handleBack} className="back-button">
          <ArrowBackIcon />
        </IconButton>
      </div>

      <form onSubmit={handleSignUp} className="sign-up-form">
        <h1>Sign Up & Subscribe</h1>

        {/* Email Input */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <h2>Payment Information</h2>

        {/* Subscription Cost Breakdown */}
        <div className="cost-breakdown">
          <p>Subscription Cost: ${subscriptionCost.toFixed(2)}</p>
          <p>Tax: ${(subscriptionCost * taxRate).toFixed(2)}</p>
          <p><strong>Total: ${totalCost}</strong></p>
        </div>

        {/* Error Display */}
        {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

        {/* Loading Indicator for Redirect */}
        {redirecting && <div className="loading-message">Redirecting to payment...</div>}

        {/* Submit Button */}
        <button type="submit" disabled={loading || redirecting}>
          {loading ? 'Processing...' : `Sign Up & Pay $${totalCost}`}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
