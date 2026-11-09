import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD6WCAe02biuHznWn0mijh7-elD_X3T6gk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spi-scanner.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spi-scanner",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spi-scanner.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1028775753963",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1028775753963:web:2fdc0dc068a4b158aea6ae"
};

// Inicialización de la app si no existe
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
