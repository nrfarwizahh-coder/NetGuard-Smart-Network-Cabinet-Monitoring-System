import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyB5YrLceo2F3mwdmp9v9Nx67siV2DTp3Ao",

    authDomain: "netguard-814d7.firebaseapp.com",

    projectId: "netguard-814d7",

    storageBucket: "netguard-814d7.firebasestorage.app",

    messagingSenderId: "1083978438506",

    appId: "1:1083978438506:web:6465e7d2f4b874deccb713"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// ==========================================
// LOGIN FORM
// ==========================================

const loginForm = document.getElementById("loginForm");

const errorMessage = document.getElementById("errorMessage");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        // Login successful
        window.location.href = "index.html";


    } catch (error) {

        console.error("Login error:", error);

        errorMessage.textContent =
            "Invalid email or password.";

    }

});