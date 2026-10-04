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

const g00Element =
    document.getElementById("g0/0");

const g01Element =
    document.getElementById("g0/1");

const lastUpdateElement =
    document.getElementById("lastUpdate");

const connectionText =
    document.getElementById("connectionText");

const systemConnection =
    document.getElementById("systemConnection");

const historyTable =
    document.getElementById("historyTable");


// ======================================================
// CONNECTION STATE
// ======================================================

const connectionState = {
    firebase: false,
    blynk: false
};


// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Logout failed. Please try again."
                );

            }

        }
    );

}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(timestamp) {

    const date =
        new Date(Number(timestamp));

    if (isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString();

}


// ======================================================
// CONNECTION STATUS
// ======================================================

function updateConnectionStatus() {

    if (!connectionText) {
        return;
    }

    if (
        connectionState.firebase &&
        connectionState.blynk
    ) {

        connectionText.textContent =
            "System Connected";

    } else if (
        connectionState.firebase ||
        connectionState.blynk
    ) {

        connectionText.textContent =
            "Partially Connected";

    } else {

        connectionText.textContent =
            "Disconnected";

    }


    if (systemConnection) {

        if (
            connectionState.firebase &&
            connectionState.blynk
        ) {

            systemConnection.textContent =
                "Connected";

        } else if (
            connectionState.firebase
        ) {

            systemConnection.textContent =
                "Firebase Connected";

        } else {

            systemConnection.textContent =
                "Disconnected";

        }

    }

}


// ======================================================
// DOOR STATUS
// ======================================================

function updateDoorStatus(status) {

    if (!doorStatusElement) {
        return;
    }

    const value =
        String(status ?? "")
        .trim()
        .toUpperCase();


    if (
        value === "OPEN" ||
        value === "OPENED" ||
        value === "1"
    ) {

        doorStatusElement.textContent =
            "OPEN";

    }

    else if (
        value === "CLOSED" ||
        value === "CLOSE" ||
        value === "0"
    ) {

        doorStatusElement.textContent =
            "CLOSED";

    }

    else {

        doorStatusElement.textContent =
            "--";

    }

}


// ======================================================
// PORT STATUS
// ======================================================

function updatePortStatus(element, value) {

    if (!element) {
        return;
    }


    if (String(value) === "1") {

        element.textContent =
            "UP";

    }

    else if (String(value) === "0") {

        element.textContent =
            "DOWN";

    }

    else {

        element.textContent =
            "--";

    }

}


// ======================================================
// UPDATE MONITORING CARDS
// ======================================================

function updateMonitoringCards(data) {

    if (!data) {

        console.warn(
            "No monitoring data received."
        );

        return;
    }


    console.log(
        "Monitoring data:",
        data
    );


    // ==================================================
    // TEMPERATURE
    // ==================================================

    if (temperatureElement) {

        const temperature =
            Number(data.temperature);

        if (!isNaN(temperature)) {

            temperatureElement.textContent =
                temperature.toFixed(1);

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
                humidity.toFixed(0);

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
    // RFID
    // ==================================================

    if (rfidAccessElement) {

        rfidAccessElement.textContent =
            data.rfidAccess ||
            data.rfid ||
            "NONE";

    }


    // ==================================================
    // UNAUTHORIZED ACCESS
    // ==================================================

    if (unauthorizedAccessElement) {

        const unauthorized =
            Number(
                data.unauthorizedAccess
            );

        unauthorizedAccessElement.textContent =
            !isNaN(unauthorized)
                ? unauthorized
                : "0";

    }


    // ==================================================
    // SECURITY
    // ==================================================

    if (securityAccessElement) {

        securityAccessElement.textContent =
            data.securityAccess ||
            data.securityLevel ||
            "SAFE";

    }


    // ==================================================
    // SWITCH STATUS
    // ==================================================

    const switchData =
        data.switchStatus;

    console.log(
        "Switch Firebase data:",
        switchData
    );


    let port0;
    let port1;


    if (
        switchData &&
        typeof switchData === "object"
    ) {

        port0 =
            switchData["0 status"];

        port1 =
            switchData["1 status"];

    }


    // ==================================================
    // G0/0
    // ==================================================

    updatePortStatus(
        g00Element,
        port0
    );


    // ==================================================
    // G0/1
    // ==================================================

    updatePortStatus(
        g01Element,
        port1
    );


    // ==================================================
    // NETWORK SWITCH
    // ON = EITHER PORT IS UP
    // OFF = BOTH PORTS ARE DOWN
    // ==================================================

    if (switchStatusElement) {

        if (
            String(port0) === "1" ||
            String(port1) === "1"
        ) {

            switchStatusElement.textContent =
                "ON";

        }

        else if (
            String(port0) === "0" &&
            String(port1) === "0"
        ) {

            switchStatusElement.textContent =
                "OFF";

        }

        else {

            switchStatusElement.textContent =
                "--";

        }

    }


    // ==================================================
    // LAST UPDATE
    // ==================================================

    if (lastUpdateElement) {

        lastUpdateElement.textContent =
            formatTime(Date.now());

    }

}


// ======================================================
// LOAD FIREBASE DATA
// ======================================================

async function loadFirebaseData() {

    try {

        console.log(
            "Loading Firebase data..."
        );


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
            "Firebase API result:",
            result
        );


        if (
            result.success &&
            result.data
        ) {

            connectionState.firebase =
                true;


            updateMonitoringCards(
                result.data
            );

        }

        else {

            connectionState.firebase =
                false;

            console.warn(
                "Firebase returned no data."
            );

        }


        updateConnectionStatus();

    }


    catch (error) {

        console.error(
            "Firebase error:",
            error
        );


        connectionState.firebase =
            false;


        updateConnectionStatus();

    }

}


// ======================================================
// LOAD BLYNK DATA
// ======================================================

async function loadBlynkData() {

    try {

        console.log(
            "Loading Blynk data..."
        );


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
            "Blynk API result:",
            result
        );


        if (
            result.success &&
            result.data
        ) {

            connectionState.blynk =
                true;

        }

        else {

            connectionState.blynk =
                false;

        }


        updateConnectionStatus();

    }


    catch (error) {

        console.error(
            "Blynk error:",
            error
        );


        connectionState.blynk =
            false;


        updateConnectionStatus();

    }

}


// ======================================================
// LOAD HISTORY
// ======================================================

async function loadHistory() {

    if (!historyTable) {
        return;
    }


    historyTable.innerHTML = `
        <tr>
            <td colspan="7">
                Loading history...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch("/api/history");


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "History result:",
            result
        );


        if (
            !result.success ||
            !result.data
        ) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No history data available
                    </td>
                </tr>
            `;

            return;

        }


        const history =
            Array.isArray(result.data)
                ? result.data
                : Object.values(result.data);


        if (history.length === 0) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No history data available
                    </td>
                </tr>
            `;

            return;

        }


        historyTable.innerHTML = "";


        history.forEach(item => {

            const row =
                document.createElement("tr");


            const timestamp =
                item.timestamp ||
                item.time ||
                item.date;


            const time =
                timestamp
                    ? formatTime(timestamp)
                    : "--";


            row.innerHTML = `
                <td>${time}</td>

                <td>
                    ${
                        item.temperature ??
                        "--"
                    } °C
                </td>

                <td>
                    ${
                        item.humidity ??
                        "--"
                    } %
                </td>

                <td>
                    ${
                        item.doorStatus ??
                        item.door ??
                        "--"
                    }
                </td>

                <td>
                    ${
                        item.rfidAccess ??
                        item.rfid ??
                        "--"
                    }
                </td>

                <td>
                    ${
                        item.unauthorizedAccess ??
                        item.unauthorized ??
                        "0"
                    }
                </td>

                <td>
                    ${
                        item.securityAccess ??
                        item.security ??
                        "--"
                    }
                </td>
            `;


            historyTable.appendChild(row);

        });

    }


    catch (error) {

        console.error(
            "History error:",
            error
        );


        historyTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load history
                </td>
            </tr>
        `;

    }

}


// ======================================================
// HISTORY DATE FILTER
// ======================================================

const historyDate =
    document.getElementById("historyDate");

const clearHistory =
    document.getElementById("clearHistory");


if (historyDate) {

    historyDate.addEventListener(
        "change",
        () => {

            loadHistory();

        }
    );

}


if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        () => {

            if (historyDate) {
                historyDate.value = "";
            }

            loadHistory();

        }
    );

}


// ======================================================
// NAVIGATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const navLinks =
            document.querySelectorAll(
                ".nav-link"
            );


        const sections =
            document.querySelectorAll(
                ".page-section"
            );


        const pageTitle =
            document.getElementById(
                "pageTitle"
            );


        navLinks.forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    navLinks.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );


                    sections.forEach(
                        section => {

                            section.style.display =
                                "none";

                        }
                    );


                    const targetId =
                        link
                            .getAttribute("href")
                            .replace("#", "");


                    const targetSection =
                        document.getElementById(
                            targetId
                        );


                    if (targetSection) {

                        targetSection.style.display =
                            "block";

                    }


                    if (pageTitle) {

                        if (
                            targetId === "monitoring"
                        ) {

                            pageTitle.textContent =
                                "Monitoring";

                        }

                        else if (
                            targetId === "history"
                        ) {

                            pageTitle.textContent =
                                "History";

                            loadHistory();

                        }

                        else if (
                            targetId === "system"
                        ) {

                            pageTitle.textContent =
                                "System";

                            updateConnectionStatus();

                        }

                    }

                }
            );

        });

    }
);


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
// START
// ======================================================

loadAllData();


setInterval(
    loadAllData,
    UPDATE_INTERVAL
);