// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCn6NmMhkDKClf-VwHZoC_Dqk-zKc8ylXg",
    authDomain: "lift-log-pwa.firebaseapp.com",
    projectId: "lift-log-pwa",
    storageBucket: "lift-log-pwa.appspot.com",
    messagingSenderId: "153286519997",
    appId: "1:153286519997:web:36966d52f56cfcd8a2dbd4",
    measurementId: "G-ZF30B9RVGQ"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
