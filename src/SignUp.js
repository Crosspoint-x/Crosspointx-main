      import React, { useState } from 'react';
      import { loadStripe } from '@stripe/stripe-js';
      import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
      import { createUserWithEmailAndPassword } from 'firebase/auth';
      import { doc, setDoc } from 'firebase/firestore'; // Firestore functions
      import { FIREBASE_AUTH, FIREBASE_DB } from './firebase'; // Firestore database
      import './SignUp.css'; // Add some custom styling

      const stripePromise = loadStripe('your-publishable-key'); // Replace with your actual public Stripe key

      const SignUp = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const stripe = useStripe();
        const elements = useElements();

        const subscriptionCost = 5.99;
        const taxRate = 0.075;
        const totalCost = (subscriptionCost * (1 + taxRate)).toFixed(2);

        const handleSignUp = async (event) => {
          event.preventDefault();
          setLoading(true);

          try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;
            console.log("Firebase user created:", user);
              
            // Create a new document in Firestore under 'users' collection
            const userRef = doc(FIREBASE_DB, 'users', user.uid);
            await setDoc(userRef, {
              email: user.email,
              player: true,
              createdAt: new Date(),
            });

            if (!stripe || !elements) {
              console.error('Stripe.js has not loaded or elements are unavailable.');
              setLoading(false);
              return;
            }

            // Get the card element from Stripe Elements
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
              console.error('CardElement not found or not mounted correctly.');
              setLoading(false);
              return;
            }

            // Create a PaymentMethod using the card details
            const { error, paymentMethod } = await stripe.createPaymentMethod({
              type: 'card',
              card: cardElement,
              billing_details: { email },
            });

            if (error) {
              console.error('[PaymentMethod Error]', error.message);
              setLoading(false);
              return;
            }

            // Send payment info to the backend to create a subscription
            const response = await fetch('/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                email,
                lookup_key: 'starter_plan',
              }),
            });

            if (!response.ok) {
              console.error('Error creating subscription:', await response.text());
              setLoading(false);
              return;
            }

            const session = await response.json();

            // Redirect to Stripe Checkout
            const stripeInstance = await stripePromise;
            await stripeInstance.redirectToCheckout({ sessionId: session.id });

            console.log('Redirecting to checkout!');
          } catch (error) {
            console.error('Error during sign-up or payment:', error.message);
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

              {/* CardElement should be inside the form */}
              <CardElement />
              
              <button type="submit" disabled={!stripe || loading}>
                {loading ? 'Processing...' : 'Sign Up & Pay $' + totalCost}
              </button>
            </form>
          </Elements>
        );
      };

      export default SignUp;
