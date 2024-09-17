import React, { createContext, useState, useCallback } from 'react';
import { auth } from '../../FireBase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [email, setEmaildoc] = useState('')
  

  const cadastrarUser = useCallback(async (email, senha) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.log("Deu erro aqui");
      
    }
  }, []);

  const logarUser = useCallback(async (email, senha) => {
    try {
      const userLogin = await signInWithEmailAndPassword(auth, email, senha);
      setUser(userLogin.user);
      return userLogin.user;
    } catch (erro) {
      console.log("Deu erro");
      
    }
  }, []);

  const deslogarUser = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('Deslogado com sucesso');
      await AsyncStorage.removeItem('@userEmail')

    } catch (erro) {
      console.log('Erro ao deslogar:', erro);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ cadastrarUser, logarUser, deslogarUser, user, setEmaildoc}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
