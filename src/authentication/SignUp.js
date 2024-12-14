import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInAnonymously, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_APP, FIREBASE_STORE, FIREBASE_STORAGE } from '../firebase';
import { collection, doc, setDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { getStripePayments } from '@invertase/firestore-stripe-payments';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { QRCodeCanvas } from 'qrcode.react';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CrosspointxLogo from '../assets/Crosspointx.svg';
import './SignUp.css';

function userCode(uid) {
  const codeLetter = String.fromCharCode((uid.charCodeAt(0) % 26) + 65);
  const codeNumOne = uid.charCodeAt(1) % 10;
  const codeNumTwo = uid.charCodeAt(2) % 10;
  const codeNumThree = uid.charCodeAt(3) % 10;

  return `${codeLetter}${codeNumOne}${codeNumTwo}${codeNumThree}`;
}

// Configuration Constants
const refID = '8155180126';
const refPass = '786592';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'your_public_key_here');
const payments = getStripePayments(FIREBASE_APP, {
  firestore: FIREBASE_STORE,
  productsCollection: "products",
  customersCollection: "customers",
});
const subscriptionCost = 5.99;
const taxRate = 0.07;
const totalCost = (subscriptionCost * (1 + taxRate)).toFixed(2);

// Utility Function for QR Code Generation
const generateQRCode = async (userId, userEmail) => {
  const qrCodeData = `User ID: ${userId}\nEmail: ${userEmail}`;
  const qrCodeSVGElement = <QRCodeCanvas value={qrCodeData} size={200} />;
  const xml = new XMLSerializer().serializeToString(qrCodeSVGElement);
  const svg64 = btoa(xml);
  return `data:image/svg+xml;base64,${svg64}`;
};

// Main Signup Component
const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create anonymous user
      const anonUser = await signInAnonymously(FIREBASE_AUTH);

      // Create Stripe checkout session
      const checkoutSessionsRef = collection(FIREBASE_STORE, "customers", anonUser.user.uid, "checkout_sessions");
      const docRef = await addDoc(checkoutSessionsRef, {
        price: "price_1Q3HpvA466XWtdBipaKVaTaV", // Replace with your Stripe price ID
        success_url: `${window.location.origin}/payments/success`,
        cancel_url: `${window.location.origin}/payments/cancel`,
      });

      // Listen for session updates
      const unsubscribe = onSnapshot(docRef, async (snap) => {
        const { error, url, payment_status } = snap.data();
        if (error) throw new Error(`Payment Error: ${error.message}`);

        if (url) {
          setRedirecting(true);
          window.location.assign(url); // Redirect to payment URL
        }

        if (payment_status === 'paid') {
          // Link email/password to anonymous user
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(anonUser.user, credential);

          // Store user data in Firestore
          await setDoc(doc(FIREBASE_STORE, 'users', anonUser.user.uid), {
            email,
            createdAt: new Date(),
          });

          // Generate and store QR code
          const qrCodeDataURL = await generateQRCode(anonUser.user.uid, email);
          const storageRef = ref(FIREBASE_STORAGE, `qrCodes/${anonUser.user.uid}.svg`);
          await uploadString(storageRef, qrCodeDataURL, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);

          // Update Firestore with QR code URL
          await setDoc(doc(FIREBASE_STORE, 'users', anonUser.user.uid), { qrCodeURL: downloadURL }, { merge: true });

          // Navigate to QR code page
          navigate('/qrcode');
        }
      });
    } catch (err) {
      setError(err.message || 'Error during signup or payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sign-up-container">
      {/* Back Button */}
      <div className="back-button-container">
        <IconButton onClick={() => navigate(-1)} className="back-button">
          <ArrowBackIcon />
        </IconButton>
      </div>

      <form onSubmit={handleSignUp} className="sign-up-form">
        <img src={CrosspointxLogo} alt="Logo" className="logo" />
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

        {/* Cost Breakdown */}
        <div className="cost-breakdown">
          <p>Subscription Cost: ${subscriptionCost.toFixed(2)}</p>
          <p>Tax: ${(subscriptionCost * taxRate).toFixed(2)}</p>
          <p><strong>Total: ${totalCost}</strong></p>
        </div>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Redirect Message */}
        {redirecting && <div className="loading-message">Redirecting to payment...</div>}

        {/* Submit Button */}
        <button type="submit" disabled={loading || redirecting}>
          {loading ? 'Processing...' : 'Sign Up & Pay'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;