// RefSignUp.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const RefSignUp = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleRefSignUp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // Add email to unapproved_refs collection
            await addDoc(collection(FIREBASE_DB, 'unapproved_refs'), {
                email,
                requestedAt: Timestamp.now(),
            });

            Alert.alert('Success', 'Your signup request has been submitted. You will receive an email upon approval.');
            setEmail('');
            navigation.navigate('Login'); // Navigate back to Login screen
        } catch (error) {
            console.error('Error submitting ref signup request:', error);
            Alert.alert('Error', 'Failed to submit signup request. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Referee Sign Up</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleRefSignUp}>
                    <Text style={styles.buttonText}>Request Sign Up</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

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

export default RefSignUp;
