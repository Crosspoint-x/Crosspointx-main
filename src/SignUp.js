// SignUp.js
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase';
import './SignUp.css'; // Add some custom styling

const stripePromise = loadStripe('your-public-key-here'); // Replace with your actual public Stripe key

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  // Example subscription details
  const subscriptionCost = 10; // Example subscription cost
  const taxRate = 0.07; // Example tax rate
  const totalCost = (subscriptionCost * (1 + taxRate)).toFixed(2); // Total cost calculation

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      console.log("Firebase user created:", user);

      // Handle Stripe Payment
      if (!stripe || !elements) return;

      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { email },
      });

      if (error) {
        console.error('[PaymentMethod Error]', error);
        setLoading(false);
        return;
      }

      // Send payment info to the backend to create a subscription and send email
      await fetch('/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          email,
          amount: totalCost, // Send total cost
        }),
      });

      console.log('Subscription and email sent successfully!');
    } catch (error) {
      console.error('Error during sign-up or payment:', error);
    }

    setLoading(false);
  };

  return (
    <Elements stripe={stripePromise}>
      <form onSubmit={handleSignUp} className="sign-up-form">
        <h1>Sign Up & Subscribe</h1>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
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
        <div className="cost-breakdown">
          <p>Subscription Cost: ${subscriptionCost.toFixed(2)}</p>
          <p>Tax: ${(subscriptionCost * taxRate).toFixed(2)}</p>
          <p><strong>Total: ${totalCost}</strong></p>
        </div>
        
        <CardElement />
        
        <button type="submit" disabled={!stripe || loading}>
          {loading ? 'Processing...' : 'Sign Up & Pay $' + totalCost}
        </button>
      </form>
    </Elements>
  );
};

export default SignUp;
