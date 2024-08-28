// Import Statements
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';

const Login = () => {
  const [isRefLogin, setIsRefLogin] = useState(false);
  const [identifier, setIdentifier] = useState(''); // email or refID
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const email = isRefLogin ? `${identifier}@ref.com` : identifier;
      await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
      Alert.alert('Success', 'Logged in successfully!');
      // Navigate to the main app screen
      // navigation.navigate('MainApp');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/Crosspointx.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isRefLogin && styles.activeToggle]}
          onPress={() => setIsRefLogin(false)}
        >
          <Text style={[styles.toggleText, !isRefLogin && styles.activeToggleText]}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isRefLogin && styles.activeToggle]}
          onPress={() => setIsRefLogin(true)}
        >
          <Text style={[styles.toggleText, isRefLogin && styles.activeToggleText]}>Ref</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder={isRefLogin ? 'Ref ID' : 'Email'}
        autoCapitalize="none"
        keyboardType={isRefLogin ? 'default' : 'email-address'}
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate(isRefLogin ? 'RefSignUp' : 'SignUp')}>
        <Text style={styles.linkText}>
          {isRefLogin ? 'Sign up as Referee' : "Don't have an account? Sign up here"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#0000ff',
  },
  toggleText: {
    color: '#000',
    fontSize: 16,
  },
  activeToggleText: {
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 50,
    backgroundColor: '#0000ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  linkText: {
    color: '#0000ff',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
