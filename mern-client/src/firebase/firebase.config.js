// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFANwCncKhJk8_XPdfuyCDcpM5o3JOppU",
  authDomain: "flexi-book-store.firebaseapp.com",
  projectId: "flexi-book-store",
  storageBucket: "flexi-book-store.firebasestorage.app",
  messagingSenderId: "1001746134285",
  appId: "1:1001746134285:web:4706410f811c9e472cac44",
  measurementId: "G-ZWDPHXJD7C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);