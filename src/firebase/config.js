import { initializeApp } from "firebase/app";


import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD3X-wVWEzH3OsZKvZHzBAXLy43j4T37o0",
    authDomain: "my-kreashiv-app.firebaseapp.com",
    projectId: "my-kreashiv-app",
    storageBucket: "my-kreashiv-app.firebasestorage.app",
    messagingSenderId: "602778307055",
    appId: "1:602778307055:android:a5c4bcf7aee8b363744e1a",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;