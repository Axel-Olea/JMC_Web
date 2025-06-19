// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZy2D2K9pmfSwGlPW_novSp3hqRc_hF5s",
  authDomain: "jmc-repair.firebaseapp.com",
  projectId: "jmc-repair",
  storageBucket: "jmc-repair.firebasestorage.app",
  messagingSenderId: "832075344352",
  appId: "1:832075344352:web:b8cffde4345a3315f2e385"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
