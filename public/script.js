// ======================================================
// NETGUARD SMART NETWORK CABINET MONITORING
// ======================================================

const UPDATE_INTERVAL = 30000;


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    signOut
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5YrLceo2F3mwdmp9v9Nx67siV2DTp3Ao",
    authDomain: "netguard-814d7.firebaseapp.com",
    projectId: "netguard-814d7",
    storageBucket: "netguard-814d7.firebasestorage.app",
    messagingSenderId: "1083978438506",
    appId: "1:1083978438506:web:6465e7d2f4b874deccb713"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);


// ======================================================
// ELEMENTS
// ======================================================

const temperatureElement =
    document.getElementById("temperature");

const humidityElement =
    document.getElementById("humidity");

const doorStatusElement =
    document.getElementById("doorStatus");

const rfidAccessElement =
    document.getElementById("rfidAccess");

const unauthorizedAccessElement =
    document.getElementById("unauthorizedAccess");

const securityAccessElement =
    document.getElementById("securityAccess");

const switchStatusElement =
    document.getElementById("switchStatus");

const lastUpdate =
    document.getElementById("lastUpdate");

const connectionStatus =
    document.getElementById("connectionStatus");


// ======================================================
// CONNECTION STATE
// ======================================================

const dataConnectionState = {
    blynk: false,
    firebase: false
};


// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await signOut(auth);

            console.log("Logout successful");

            // Change this if your login page has another filename
            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

            alert("Logout failed. Please try again.");

        }

    });

}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(timestamp) {

    const date = new Date(Number(timestamp));

    if (isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleTimeString();

}


// ======================================================
// UPDATE CONNECTION STATUS
// ======================================================

function updateConnectionStatus() {

    if (!connectionStatus) {
        return;
    }

    if (dataConnectionState.blynk &&
        dataConnectionState.firebase) {

        connectionStatus.textContent =
            "System Connected";

    } else if (
        dataConnectionState.blynk ||
        dataConnectionState.firebase
    ) {

        connectionStatus.textContent =
            "Partially Connected";

    } else {

        connectionStatus.textContent =
            "Disconnected";

    }

}


// ======================================================
// UPDATE DOOR STATUS
// ======================================================

function updateDoorStatus(status) {

    if (!doorStatusElement) {
        return;
    }

    const value =
        String(status || "").toUpperCase();

    if (
        value === "OPEN" ||
        value === "1" ||
        value === "OPENED"
    ) {

        doorStatusElement.textContent =
            "OPEN";

    } else if (
        value === "CLOSED" ||
        value === "0" ||
        value === "CLOSE"
    ) {

        doorStatusElement.textContent =
            "CLOSED";

    } else {

        doorStatusElement.textContent =
            "--";

    }

}


// ======================================================
// UPDATE MONITORING CARDS
// ======================================================

function updateMonitoringCards(data) {

    if (!data) {

        console.warn(
            "No Firebase data received"
        );

        return;
    }


    // ==================================================
    // TEMPERATURE
    // ==================================================

    if (temperatureElement) {

        const temperature =
            Number(data.temperature);

        if (!isNaN(temperature)) {

            temperatureElement.textContent =
                `${temperature.toFixed(1)}°C`;

        } else {

            temperatureElement.textContent =
                "--";

        }

    }


    // ==================================================
    // HUMIDITY
    // ==================================================

    if (humidityElement) {

        const humidity =
            Number(data.humidity);

        if (!isNaN(humidity)) {

            humidityElement.textContent =
                `${humidity.toFixed(0)}%`;

        } else {

            humidityElement.textContent =
                "--";

        }

    }


    // ==================================================
    // DOOR
    // ==================================================

    updateDoorStatus(
        data.doorStatus
    );


    // ==================================================
    // RFID ACCESS
    // ==================================================

    if (rfidAccessElement) {

        rfidAccessElement.textContent =
            data.rfidAccess || "NONE";

    }


    // ==================================================
    // UNAUTHORIZED ACCESS
    // ==================================================

    if (unauthorizedAccessElement) {

        const unauthorized =
            Number(data.unauthorizedAccess);

        unauthorizedAccessElement.textContent =
            !isNaN(unauthorized)
                ? unauthorized
                : "0";

    }


    // ==================================================
    // SECURITY ACCESS
    // ==================================================

    if (securityAccessElement) {

        securityAccessElement.textContent =
            data.securityAccess || "SAFE";

    }


// ==================================================
// SWITCH STATUS
// ==================================================

if (switchStatusElement) {

    const switchData = data.switchStatus;

    console.log("Switch Firebase data:", switchData);

    if (
        switchData &&
        typeof switchData === "object"
    ) {

        const port0 = switchData["0 status"];
        const port1 = switchData["1 status"];

        console.log(
            "Switch G0/0:",
            port0,
            "G0/1:",
            port1
        );

        // If either port is UP
        if (
            String(port0) === "1" ||
            String(port1) === "1"
        ) {

            switchStatusElement.textContent = "ON";

        } else {

            switchStatusElement.textContent = "OFF";
        }

    } else {

        switchStatusElement.textContent = "--";
    }
}


    // ==================================================
    // G0/0
    // ==================================================

    const g00Element =
        document.getElementById("g0/0");

    if (g00Element) {

        const g00Status =
            data.g0?.["0 status"];

        if (String(g00Status) === "1") {

            g00Element.textContent =
                "UP";

        } else if (
            String(g00Status) === "0"
        ) {

            g00Element.textContent =
                "DOWN";

        } else {

            g00Element.textContent =
                "--";

        }

    }


    // ==================================================
    // G0/1
    // ==================================================

    const g01Element =
        document.getElementById("g0/1");

    if (g01Element) {

        const g01Status =
            data.g0?.["1 status"];

        if (String(g01Status) === "1") {

            g01Element.textContent =
                "UP";

        } else if (
            String(g01Status) === "0"
        ) {

            g01Element.textContent =
                "DOWN";

        } else {

            g01Element.textContent =
                "--";

        }

    }


    // ==================================================
    // LAST UPDATE
    // ==================================================

    if (lastUpdate) {

        lastUpdate.textContent =
            `Last update: ${formatTime(Date.now())}`;

    }


    // Firebase connected
    dataConnectionState.firebase = true;

    updateConnectionStatus();

}


// ======================================================
// LOAD FIREBASE DATA
// ======================================================

async function loadFirebaseData() {

    try {

        const response =
            await fetch("/api/firebase");

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "Firebase data:",
            result
        );

        if (
            result.success &&
            result.data
        ) {

            updateMonitoringCards(
                result.data
            );

        } else {

            dataConnectionState.firebase =
                false;

            updateConnectionStatus();

        }

    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        dataConnectionState.firebase =
            false;

        updateConnectionStatus();

    }

}


// ======================================================
// LOAD BLYNK DATA
// ======================================================

async function loadBlynkData() {

    try {

        const response =
            await fetch("/api/data");

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "Blynk data:",
            result
        );

        if (
            result.success &&
            result.data
        ) {

            dataConnectionState.blynk =
                true;

            updateConnectionStatus();

        } else {

            dataConnectionState.blynk =
                false;

            updateConnectionStatus();

        }

    } catch (error) {

        console.error(
            "Blynk error:",
            error
        );

        dataConnectionState.blynk =
            false;

        updateConnectionStatus();

    }

}


// ======================================================
// LOAD ALL DATA
// ======================================================

async function loadAllData() {

    await Promise.all([
        loadFirebaseData(),
        loadBlynkData()
    ]);

}


// ======================================================
// AUTO UPDATE
// ======================================================

loadAllData();

setInterval(
    loadAllData,
    UPDATE_INTERVAL
);


// ======================================================
// NAVIGATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const navLinks =
            document.querySelectorAll(
                ".sidebar a"
            );

        navLinks.forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navLinks.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    link.classList.add(
                        "active"
                    );

                }
            );

        });

    }
);