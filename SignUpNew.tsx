import React, { useState } from 'react'; // Import "useState" from react
import * as reactNatively from 'react-native'; // Import all from react native as 'reactNatively'  
import { useNavigation } from "@react-navigation/native"; // Import "useNavigation" from react-native
import { FIREBASE_DB, FIREBASE_AUTH } from 'FirebaseConfig';
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [business, setBusiness] = useState(false);
    const navigation = useNavigation(); 
}

const HandleBusinessSignUp = async () => {
    if (!email) {
        reactNatively.Alert('Error')
    }
}