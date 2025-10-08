import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAie9vf7D4QZRKzVm_jYNMo6bAa8Ceqcw",
  authDomain: "bitirmeprojesi-72ddc.firebaseapp.com",
  projectId: "bitirmeprojesi-72ddc",
  storageBucket: "bitirmeprojesi-72ddc.firebasestorage.app",
  messagingSenderId: "375331032401",
  appId: "1:375331032401:web:73cd7f2963ebcada339770",
  measurementId: "G-7EV9HK90LE"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
