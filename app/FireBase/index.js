// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYHPuIO873DxTCmAtmR95zm3Uakzh1XF0",
  authDomain: "appcras-393f7.firebaseapp.com",
  projectId: "appcras-393f7",
  storageBucket: "appcras-393f7.appspot.com",
  messagingSenderId: "12608548030",
  appId: "1:12608548030:web:76b43831224be34fdd02ef",
  measurementId: "G-HYYBXCNPXN"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Configura o Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializa o Firestore
const db = getFirestore(app);

export { auth, db };
