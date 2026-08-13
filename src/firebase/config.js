import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyD3X-wVWEzH3OsZKvZHzBAXLy43j4T37o0",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-kreashiv-app.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "my-kreashiv-app",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-kreashiv-app.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "602778307055",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:602778307055:android:a5c4bcf7aee8b363744e1a",
};

let app = null;
let db = null;

if (firebaseConfig.apiKey) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase warning: EXPO_PUBLIC_FIREBASE_API_KEY is not defined. Firebase features will not work.");
}

export { db };
export default app;