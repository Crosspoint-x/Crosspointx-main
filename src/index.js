import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import SignUp from './SignUp';
import { getStripePayments } from "@invertase/firestore-stripe-payments";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Initialize Stripe
// const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// export default function StripeApp() {
//   const options = {
//     clientSecret: '{{CLIENT_SECRET}}',
//   };

//   return (
//     <Elements stripe={stripePromise} options={options}>
//       <SignUp />
//     </Elements>
//   );
// }

// const app = getApp();
// const payments = getStripePayments(app, {
//   const: options = {
//     clientSecret: '{{CLIENT_SECRET}}',
//   },
//   productsCollection: "products",
//   customersCollection: "customers",
//   })

//   return (
//     <Elements stripe={stripePromise} options={options}>
//       <SignUp />
//     </Elements>
//   );