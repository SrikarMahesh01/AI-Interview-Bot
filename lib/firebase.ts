import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJbA8xL9vOT-NcF94S23M7XqSfrjVZ6aY",
  authDomain: "ai-interview-bot-18.firebaseapp.com",
  projectId: "ai-interview-bot-18",
  storageBucket: "ai-interview-bot-18.firebasestorage.app",
  messagingSenderId: "244323944822",
  appId: "1:244323944822:web:96981b8d489c1d71f2d257"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
