import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD49jQJla2q0M4Srrjw4Ecy9HIWKMwyfsY",
    authDomain: "arithme-db2b1.firebaseapp.com",
    projectId: "arithme-db2b1",
    storageBucket: "arithme-db2b1.firebasestorage.app",
    messagingSenderId: "932468565264",
    appId: "1:932468565264:web:f0ef1c8fd2d056bcebb195",
    measurementId: "G-CNXEV4ESKT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);