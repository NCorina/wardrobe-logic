// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAUmZwe-lhcLci01-eIcHzyH6F7vI5b4M",
  authDomain: "wardrobe-logic.firebaseapp.com",
  projectId: "wardrobe-logic",
  storageBucket:"wardrobe-logic.firebasestorage.app",
  messagingSenderId: "890498057914",
  appId: "1:890498057914:web:86626965fc670edd856483",
  measurementId: "G-0BQ9B65MW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();