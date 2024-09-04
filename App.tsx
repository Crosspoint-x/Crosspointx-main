import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from './app/screens/Login';
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import Details from "./app/screens/Details";
import List from "./app/screens/List";
import SignUp from "./app/screens/SignUp";  
import RefSignUp from "./app/screens/RefSignUp"; 
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { StyleSheet, Button } from "react-native";      

const Stack = createNativeStackNavigator();

const InsideStack = createNativeStackNavigator();

function InsideLayout() {
    return (
        <InsideStack.Navigator>
            <InsideStack.Screen name="Leaderboard" component={List} />
            <InsideStack.Screen name="details" component={Details} />
        </InsideStack.Navigator>
    );
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            setUser(user);
        });
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName='Login'>
                {user ? (
                    <Stack.Screen name='Inside' component={InsideLayout} options={{ headerShown: false }}/>   
                ) : (
                    <>
                        <Stack.Screen 
                            name='Login' 
                            component={Login} 
                            options={{ 
                                headerShown: false,
                                headerLeft: () => (
                                    <Button
                                        title="Back"
                                        onPress={() => navigation.goBack()}
                                    />
                                )
                            }}
                        />
                        <Stack.Screen 
                            name='SignUp' 
                            component={SignUp} 
                            options={{ 
                                headerLeft: () => (
                                    <Button
                                        title="Back"
                                        onPress={() => navigation.goBack()}
                                    />
                                )
                            }}
                        />
                        <Stack.Screen 
                            name='RefSignUp' 
                            component={RefSignUp} 
                            options={{ 
                                headerLeft: () => (
                                    <Button
                                        title="Back"
                                        onPress={() => navigation.goBack()}
                                    />
                                )
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    }
});
