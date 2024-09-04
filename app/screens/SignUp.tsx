import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';                      

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRef, setIsRef] = useState(false);
  const navigation = useNavigation();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter a valid email and password.');
      return;
    }

    try {
      const paymentIntentResponse = await initPaymentSheet({
        paymentIntentClientSecret: 'YOUR_PAYMENT_INTENT_CLIENT_SECRET',
        applePay: {
          merchantCountryCode: 'US',
        },
        googlePay: {
          testEnv: true,
          currencyCode: 'usd',
          countryCode: 'US',
        },
        style: 'alwaysDark',
        merchantDisplayName: 'YOUR_MERCHANT_DISPLAY_NAME',
        customerEphemeralKeySecret: 'YOUR_CUSTOMER_EPHEMERAL_KEY_SECRET',
      });

      await presentPaymentSheet();

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
  container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: '#fff',
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
  },
  input: {
      height: 50,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 25,
      paddingHorizontal: 15,
      fontSize: 16,
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
  },
  button: {
      height: 50,
      backgroundColor: '#0000ff',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
  },
  buttonText: {
      color: '#fff',
      fontSize: 18,
  },
});