// Import Statements
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRoute, useNavigation } from '@react-navigation/native';

const RefPasswordSetup = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { token, refID } = route.params as { token: string; refID: string };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verify token (Optional): You can implement token verification logic here
  }, []);

  const handlePasswordSetup = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const email = `${refID}@ref.com`;
      // Create user in Firebase Auth
      await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);

      // Update ref document in Firestore
      await updateDoc(doc(FIREBASE_DB, 'refs', refID), {
        status: 'active',
        uid: FIREBASE_AUTH.currentUser?.uid,
      });

      Alert.alert('Success', 'Your account has been set up successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error setting up password:', error);
      Alert.alert('Error', 'Failed to set up password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePasswordSetup}>
          <Text style={styles.buttonText}>Set Password</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RefPasswordSetup;

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
