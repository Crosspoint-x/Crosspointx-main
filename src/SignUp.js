import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_APP, FIREBASE_STORE } from './firebase';
import { loadStripe } from '@stripe/stripe-js';
import { getStripePayments } from '@invertase/firestore-stripe-payments';
import { collection, doc, setDoc, addDoc, onSnapshot } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CrosspointxLogo from './assets/Crosspointx.svg';
import { FIREBASE_STORAGE } from './firebase'; // Import your Firebase storage instance
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { QRCodeCanvas } from 'qrcode.react'; // Updated import for QRCodeCanvas
import './SignUp.css';
import { signInAnonymously, linkWithCredential, EmailAuthProvider } from 'firebase/auth'; // Import necessary Firebase methods

const refID = '8155180126';
const refPass = '786592';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_51Ow7goA466XWtdBifnrLrOBoMOu6VGECzCQMuMvB5faDbWBClqqQHRMoF1aXEPQVQiDX17j3gbtBtU2wmjdl7rPd002dR4kDFT');

const subscriptionCost = 5.99; // Define the cost of subscription
const taxRate = 0.07; // Define the tax rate
const totalCost = (subscriptionCost * (1 + taxRate)).toFixed(2); // Calculate total cost


function userCode(uid) {
  const userID = FIREBASE_AUTH(user.uid)
  
  const codeLetter = String.fromCharCode((userID.charCodeAt(0) % 26) + 65);
  const codeNumOne = (uid.charCodeAt(1) % 10);
  const codeNumTwo = (uid.charCodeAt(2) % 10);

  const codeFinal = '${codeLetter}${codeNumOne}${codeNumTwo}';
}

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
  const [paymentSuccess, setPaymentSuccess] = useState(false);          
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const anonUser = await signInAnonymously(FIREBASE_AUTH);

      const checkoutSessionsCollection = collection(FIREBASE_STORE, "customers", anonUser.user.uid, "checkout_sessions");

      const docRef = await addDoc(checkoutSessionsCollection, {
        price: "price_1Q3HpvA466XWtdBipaKVaTaV", 
        success_url: `${window.location.origin}/payments/success`,
        cancel_url: `${window.location.origin}/payments/cancel`,
      });

      const unsubscribe = onSnapshot(docRef, async (snap) => {
        const { error, url, payment_status } = snap.data();
        if (error) {
          setError(`An error occurred: ${error.message}`);
          setLoading(false);
        }

        if (url) {
          setRedirecting(true);
          window.location.assign(url);
        }

        if (payment_status === 'paid') {
          try {
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(anonUser.user, credential);

            await setDoc(doc(FIREBASE_STORE, 'users', anonUser.user.uid), {
              email: email,
              createdAt: new Date(),
            });

            // Generate and store the QR code after payment success and account creation
            await generateAndStoreQRCode(anonUser.user.uid, email);

            console.log('User account created successfully after payment.');
            navigate('/qrcode');
          } catch (error) {
            setError('Error creating account. Please try again.');
          }
        }
      });
    } catch (error) {
      setError(`Error during sign-up or payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const generateAndStoreQRCode = async (userId, userEmail) => {
    try {
      const qrCodeData = `User ID: ${userId}\nEmail: ${userEmail}`;
      const storageRef = ref(FIREBASE_STORAGE, `qrCodes/${userId}.svg`);
      
      // Generate SVG data
      const qrCodeSVGElement = <QRCodeCanvas value={qrCodeData} size={200} />;
      const xml = new XMLSerializer().serializeToString(qrCodeSVGElement);
      const svg64 = btoa(xml);
      const qrCodeDataURL = `data:image/svg+xml;base64,${svg64}`;

      await uploadString(storageRef, qrCodeDataURL, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);

      await setDoc(doc(FIREBASE_STORE, 'users', userId), { qrCodeURL: downloadURL }, { merge: true });
    } catch (error) {
      setError('Failed to generate QR code. Please try again later.');
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
          {loading ? 'Processing...' : 'Sign Up & Pay'}
        </button>
      </form>

      {/* Show QR code after payment success */}
      {paymentSuccess && (
        <div className="qr-code-container">
          <h3>Your Account QR Code</h3>
          <QRCodeCanvas value={email} size={200} />
        </div>
      )}
    </div>
  );
};

export default {SignUp, userCode};