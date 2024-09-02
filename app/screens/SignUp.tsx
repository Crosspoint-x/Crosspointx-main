import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Stripe from 'react-native-stripe-api';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRef, setIsRef] = useState(false);
  const navigation = useNavigation();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);

  const stripe = new Stripe('YOUR_STRIPE_SECRET_KEY');

  const handlePayment = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter a valid email and password.');
      return;
    }

    try {
      const paymentIntentResponse = await stripe.createPaymentIntent({
        amount: 1000, // $10.00
        currency: 'usd',
        payment_method_types: ['card'],
      });

      setPaymentIntent(paymentIntentResponse.id);

      const paymentMethodResponse = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      setPaymentMethod(paymentMethodResponse.id);

      await stripe.confirmPaymentIntent(paymentIntentResponse.id, {
        payment_method: paymentMethodResponse.id,
      });

      // Payment successful, create user account
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
        email,
        createdAt: Timestamp.now(),
      });

      Alert.alert('Success', 'Sign up successful!');
      setEmail('');
      setPassword('');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRef ? 'Referee Sign Up' : 'User Sign Up'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {!isRef && (
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePayment}
          >
            <Text style={styles.buttonText}>{isRef ? 'Request Sign Up' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  // ... (rest of the styles remain the same)
});