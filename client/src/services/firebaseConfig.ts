import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase (se poblará con variables de entorno o valores del proyecto Firebase del usuario)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForDevelopmentMode-SPI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spi-regulatory-scanner.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spi-regulatory-scanner",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spi-regulatory-scanner.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

// Inicialización de la app si no existe
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
