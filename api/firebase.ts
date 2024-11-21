// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeFM7QjzgLP1xO6YhiW6FcLSyTGMu_Tz8",
  authDomain: "yogaadmin-59d01.firebaseapp.com",
  projectId: "yogaadmin-59d01",
  storageBucket: "yogaadmin-59d01.firebasestorage.app",
  messagingSenderId: "510297975866",
  appId: "1:510297975866:web:d07411724b4be455d4d903",
  measurementId: "G-8HRHJGQD4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
