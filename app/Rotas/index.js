import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from '../Pages/Autenticacao';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../FireBase';
import Home from '../Pages/Home';
import Login from '../Pages/Login';
import Cadastro from '../Pages/Cadastro';
import Adm from '../Pages/Adm';

const Stack = createStackNavigator();


export default function Rotas() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

       
        return () => unsubscribe();
    }, []);

    return (
        <AuthProvider>
            <Stack.Navigator>
                {user ? (
                    user.uid === 'j02WW3nHAnO6jtvu6hW0vabl67t1' ? (
                        <Stack.Screen name='Adm' component={Adm} options={{
                            headerShown:false
                        }} />
                    ) : (
                        <Stack.Screen name='Pagina do usuário' component={Home} />
                    )
                ) : (
                    <>
                        <Stack.Screen name='Login' component={Login} options={{ headerShown: false }} />
                        <Stack.Screen name='Cadastro' component={Cadastro} />
                    </>
                )}
            </Stack.Navigator>
        </AuthProvider>
    );
}
