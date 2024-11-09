// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxAAOEwIM5pAdHdUCOR2hb8fqb-jr6O3I",
  authDomain: "password-manager-3921b.firebaseapp.com",
  databaseURL: "https://password-manager-3921b-default-rtdb.firebaseio.com",
  projectId: "password-manager-3921b",
  storageBucket: "password-manager-3921b.firebasestorage.app",
  messagingSenderId: "1064511979779",
  appId: "1:1064511979779:web:a25f9bb19f49331d4da936"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
//export const db = getFirestore(app);
export const db = getDatabase(app);
export default app;
