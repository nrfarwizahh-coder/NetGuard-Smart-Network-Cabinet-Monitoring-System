// ======================================================
// NETGUARD DASHBOARD
// BLYNK + FIREBASE
// ======================================================

const UPDATE_INTERVAL = 30000; // 30 seconds


// ======================================================
// BLYNK ELEMENTS
// ======================================================

const temperatureElement =
    document.getElementById("temperature");

const humidityElement =
    document.getElementById("humidity");

const doorStatusElement =
    document.getElementById("doorStatus");

const rfidAccessElement =
    document.getElementById("rfidAccess");

const rfidAccessStatusElement =
    document.getElementById("rfidAccessStatus");

const unauthorizedAccessElement =
    document.getElementById("unauthorizedAccess");

const securityAccessElement =
    document.getElementById("securityAccess");

const doorStatusLarge =
    document.getElementById("doorStatusLarge");

const doorDescription =
    document.getElementById("doorDescription");

const connectionText =
    document.getElementById("connectionText");

const lastUpdate =
    document.getElementById("lastUpdate");

const systemBlynk =
    document.getElementById("systemBlynk");

const systemFirebase =
    document.getElementById("systemFirebase");


// ======================================================
// FIREBASE ELEMENTS
// ======================================================

const firebaseTemperature =
    document.getElementById("firebaseTemperature");

const firebaseHumidity =
    document.getElementById("firebaseHumidity");

const firebaseDoor =
    document.getElementById("firebaseDoor");

const firebaseRfid =
    document.getElementById("firebaseRfid");

const firebaseUser =
    document.getElementById("firebaseUser");

const firebaseAccessStatus =
    document.getElementById("firebaseAccessStatus");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const firebaseTimestamp =
    document.getElementById("firebaseTimestamp");

const firebaseConnection =
    document.getElementById("firebaseConnection");


// ======================================================
// FIREBASE NETWORK ELEMENTS
// ======================================================

const firebaseSwitchStatus =
    document.getElementById("firebaseSwitchStatus");

const firebaseG0 =
    document.getElementById("firebaseG0");

const firebaseG1 =
    document.getElementById("firebaseG1");


// ======================================================
// ETHERNET ELEMENTS
// ======================================================

const ethernetE0 =
    document.getElementById("ethernetE0");

const ethernetE1 =
    document.getElementById("ethernetE1");


// ======================================================
// TABLE ELEMENTS
// ======================================================

const historyTable =
    document.getElementById("historyTable");

const accessLogsTable =
    document.getElementById("accessLogsTable");

const alertsTable =
    document.getElementById("alertsTable");


// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "--";
    }

    const number = parseFloat(value);

    if (isNaN(number)) {
        return "--";
    }

    return number.toFixed(1);
}


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(timestamp) {

    if (!timestamp) {
        return "--";
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString();
}


// ======================================================
// GET STATUS VALUE
// ======================================================

function getStatusValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "--";
    }

    if (
        typeof value === "object"
    ) {

        if (
            value.status !== undefined
        ) {
            return value.status;
        }

    }

    return value;
}


// ======================================================
// SWITCH STATUS
// 1 = ON
// 0 = OFF
// ======================================================

function setSwitchStatus(element, status) {

    if (!element) {
        return;
    }

    status = getStatusValue(status);

    if (
        status === "--" ||
        status === ""
    ) {

        element.textContent = "--";
        element.style.color = "";
        return;

    }

    let value =
        String(status)
            .trim()
            .toLowerCase();


    if (value === "1") {

        value = "ON";

    }

    else if (value === "0") {

        value = "OFF";

    }

    else if (value === "true") {

        value = "ON";

    }

    else if (value === "false") {

        value = "OFF";

    }


    element.textContent = value;


    if (value === "on") {

        element.style.color = "#16a34a";

    }

    else if (value === "off") {

        element.style.color = "#dc2626";

    }

    else {

        element.style.color = "";

    }

}


// ======================================================
// PORT STATUS
// 1 = UP
// 0 = DOWN
// ======================================================

function setPortStatus(element, status) {

    if (!element) {
        return;
    }

    status = getStatusValue(status);

    if (
        status === "--" ||
        status === ""
    ) {

        element.textContent = "--";
        element.style.color = "";
        return;

    }

    let value =
        String(status)
            .trim()
            .toLowerCase();


    if (value === "1") {

        value = "UP";

    }

    else if (value === "0") {

        value = "DOWN";

    }

    else if (value === "true") {

        value = "UP";

    }

    else if (value === "false") {

        value = "DOWN";

    }


    element.textContent = value;


    if (
        value === "up" ||
        value === "connected"
    ) {

        element.style.color = "#16a34a";

    }

    else if (
        value === "down" ||
        value === "disconnected"
    ) {

        element.style.color = "#dc2626";

    }

    else {

        element.style.color = "";

    }

}


// ======================================================
// BLYNK DATA
// ======================================================

async function loadBlynkData() {

    try {

        const response =
            await fetch("/api/data");


        if (!response.ok) {

            throw new Error(
                "Blynk API error: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Blynk data:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Blynk data unavailable"
            );

        }


        const data =
            result.data || {};


        // ==================================================
        // TEMPERATURE
        // ==================================================

        if (temperatureElement) {

            temperatureElement.textContent =
                formatNumber(
                    data.temperature
                );

        }


        // ==================================================
        // HUMIDITY
        // ==================================================

        if (humidityElement) {

            humidityElement.textContent =
                formatNumber(
                    data.humidity
                );

        }


        // ==================================================
        // RFID STATUS
        // ==================================================

        const rfidStatus =
            data.rfid?.status ??
            data.rfidStatus ??
            "--";


        if (rfidAccessStatusElement) {

            rfidAccessStatusElement.textContent =
                rfidStatus;

        }


        // ==================================================
        // RFID UID
        // ==================================================

        if (rfidAccessElement) {

            rfidAccessElement.textContent =
                data.rfid?.uid ??
                data.uid ??
                "--";

        }


        // ==================================================
        // FAILED ATTEMPTS
        // ==================================================

        const failedAttempts =
            data.security?.failedAttempts ??
            data.failedAttempts ??
            0;


        if (unauthorizedAccessElement) {

            unauthorizedAccessElement.textContent =
                failedAttempts;

        }


        // ==================================================
        // SECURITY STATUS
        // ==================================================

        const securityStatus =
            data.security?.status ??
            data.securityStatus ??
            "--";


        if (securityAccessElement) {

            securityAccessElement.textContent =
                securityStatus;

        }


        // ==================================================
        // DOOR STATUS
        // ==================================================

        if (doorStatusElement) {

            doorStatusElement.textContent =
                rfidStatus;

        }


        if (doorStatusLarge) {

            doorStatusLarge.textContent =
                rfidStatus;

        }


        if (doorDescription) {

            const status =
                String(rfidStatus)
                    .toLowerCase();


            if (
                status.includes("authorized")
            ) {

                doorDescription.textContent =
                    "Authorized RFID access detected.";

            }

            else if (
                status.includes("unauthorized")
            ) {

                doorDescription.textContent =
                    "Unauthorized RFID access detected.";

            }

            else {

                doorDescription.textContent =
                    "Waiting for RFID access data.";

            }

        }


        // ==================================================
        // BLYNK G0/0
        // ==================================================

        let g0Status =
            data.ethernet?.E0 ??
            data.ethernet?.G0 ??
            data.ethernet?.["G0/0"] ??
            data.g0 ??
            data.G0 ??
            "--";


        g0Status =
            getStatusValue(g0Status);


        setPortStatus(
            ethernetE0,
            g0Status
        );


        // ==================================================
        // BLYNK G0/1
        // ==================================================

        let g1Status =
            data.ethernet?.E1 ??
            data.ethernet?.G1 ??
            data.ethernet?.["G0/1"] ??
            data.g1 ??
            data.G1 ??
            "--";


        g1Status =
            getStatusValue(g1Status);


        setPortStatus(
            ethernetE1,
            g1Status
        );


        // ==================================================
        // CONNECTION
        // ==================================================

        if (connectionText) {

            connectionText.textContent =
                "Connected";

        }


        if (systemBlynk) {

            systemBlynk.textContent =
                "🟢 Connected";

        }


        // ==================================================
        // LAST UPDATE
        // ==================================================

        if (lastUpdate) {

            if (result.updatedAt) {

                lastUpdate.textContent =
                    new Date(
                        result.updatedAt
                    ).toLocaleTimeString();

            }

            else {

                lastUpdate.textContent =
                    new Date()
                        .toLocaleTimeString();

            }

        }

    }

    catch (error) {

        console.error(
            "Blynk Error:",
            error
        );


        if (connectionText) {

            connectionText.textContent =
                "Connection Error";

        }


        if (systemBlynk) {

            systemBlynk.textContent =
                "🔴 Disconnected";

        }

    }

}


// ======================================================
// FIREBASE CURRENT DATA
// ======================================================

async function loadFirebaseData() {

    try {

        const response =
            await fetch("/api/firebase");


        if (!response.ok) {

            throw new Error(
                "Firebase API error: " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Firebase response:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Firebase data unavailable"
            );

        }


        const data =
            result.data || {};


        console.log(
            "Firebase current data:",
            data
        );


        // ==================================================
        // TEMPERATURE
        // ==================================================

        if (firebaseTemperature) {

            firebaseTemperature.textContent =
                formatNumber(
                    data.temperature
                );

        }


        // ==================================================
        // HUMIDITY
        // ==================================================

        if (firebaseHumidity) {

            firebaseHumidity.textContent =
                formatNumber(
                    data.humidity
                );

        }


        // ==================================================
        // RFID UID
        // ==================================================

        if (firebaseRfid) {

            firebaseRfid.textContent =
                data.uid ??
                data.rfid?.uid ??
                "--";

        }


        // ==================================================
        // USER
        // ==================================================

        if (firebaseUser) {

            firebaseUser.textContent =
                data.userName ??
                data.user ??
                data.name ??
                "--";

        }


        // ==================================================
        // ACCESS STATUS
        // ==================================================

        const accessStatus =
            data.accessStatus ??
            data.status ??
            "--";


        if (firebaseAccessStatus) {

            firebaseAccessStatus.textContent =
                accessStatus;

        }


        if (firebaseDoor) {

            firebaseDoor.textContent =
                accessStatus;

        }


        // ==================================================
        // NETWORK SWITCH
        // ==================================================

        let switchStatus =
            data.switchStatus;


        if (
            switchStatus &&
            typeof switchStatus === "object"
        ) {

            // switchStatus.status

            if (
                switchStatus.status !== undefined
            ) {

                switchStatus =
                    switchStatus.status;

            }

            // switchStatus[0].status

            else if (
                switchStatus[0] &&
                switchStatus[0].status !== undefined
            ) {

                switchStatus =
                    switchStatus[0].status;

            }

            // switchStatus["0"].status

            else if (
                switchStatus["0"] &&
                switchStatus["0"].status !== undefined
            ) {

                switchStatus =
                    switchStatus["0"].status;

            }

            // switchStatus[1].status

            else if (
                switchStatus[1] &&
                switchStatus[1].status !== undefined
            ) {

                switchStatus =
                    switchStatus[1].status;

            }

            // switchStatus["1"].status

            else if (
                switchStatus["1"] &&
                switchStatus["1"].status !== undefined
            ) {

                switchStatus =
                    switchStatus["1"].status;

            }

        }


        setSwitchStatus(
            firebaseSwitchStatus,
            switchStatus
        );


        // ==================================================
        // FIREBASE G0/0
        // ==================================================

        let g0Status =
            "--";


        if (
            data.g0 &&
            typeof data.g0 === "object"
        ) {

            if (
                data.g0[0] !== undefined
            ) {

                g0Status =
                    getStatusValue(
                        data.g0[0]
                    );

            }

            else if (
                data.g0["0"] !== undefined
            ) {

                g0Status =
                    getStatusValue(
                        data.g0["0"]
                    );

            }

            else if (
                data.g0.status !== undefined
            ) {

                g0Status =
                    data.g0.status;

            }

        }


        if (
            g0Status === "--" &&
            data["G0/0"] !== undefined
        ) {

            g0Status =
                getStatusValue(
                    data["G0/0"]
                );

        }


        setPortStatus(
            firebaseG0,
            g0Status
        );


        // ==================================================
        // FIREBASE G0/1
        // ==================================================

        let g1Status =
            "--";


        if (
            data.g0 &&
            typeof data.g0 === "object"
        ) {

            if (
                data.g0[1] !== undefined
            ) {

                g1Status =
                    getStatusValue(
                        data.g0[1]
                    );

            }

            else if (
                data.g0["1"] !== undefined
            ) {

                g1Status =
                    getStatusValue(
                        data.g0["1"]
                    );

            }

        }


        // Separate g1 node

        if (
            g1Status === "--" &&
            data.g1 !== undefined
        ) {

            g1Status =
                getStatusValue(
                    data.g1
                );

        }


        // Direct G0/1

        if (
            g1Status === "--" &&
            data["G0/1"] !== undefined
        ) {

            g1Status =
                getStatusValue(
                    data["G0/1"]
                );

        }


        setPortStatus(
            firebaseG1,
            g1Status
        );


        // ==================================================
        // TIMESTAMP
        // ==================================================

        if (firebaseTimestamp) {

            if (
                data.date &&
                data.time
            ) {

                firebaseTimestamp.textContent =
                    `${data.date} ${data.time}`;

            }

            else if (
                data.timestamp
            ) {

                firebaseTimestamp.textContent =
                    formatTime(
                        data.timestamp
                    );

            }

            else {

                firebaseTimestamp.textContent =
                    "--";

            }

        }


        // ==================================================
        // CONNECTION
        // ==================================================

        if (firebaseStatus) {

            firebaseStatus.textContent =
                "🟢 Connected";

        }


        if (firebaseConnection) {

            firebaseConnection.textContent =
                "🟢 Connected";

        }


        if (systemFirebase) {

            systemFirebase.textContent =
                "🟢 Connected";

        }

    }

    catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        if (firebaseStatus) {

            firebaseStatus.textContent =
                "🔴 Error";

        }


        if (firebaseConnection) {

            firebaseConnection.textContent =
                "🔴 Disconnected";

        }


        if (systemFirebase) {

            systemFirebase.textContent =
                "🔴 Disconnected";

        }

    }

}


// ======================================================
// FIREBASE HISTORY
// ======================================================

async function loadFirebaseHistory() {

    try {

        const response =
            await fetch("/api/history");


        if (!response.ok) {
            return;
        }


        const result =
            await response.json();


        if (!result.success) {
            return;
        }


        if (!historyTable) {
            return;
        }


        const records =
            result.data || [];


        if (records.length === 0) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="3">
                        No Firebase history available.
                    </td>
                </tr>
            `;

            return;

        }


        historyTable.innerHTML =
            records.map(item => {

                const timestamp =
                    item.date &&
                    item.time
                        ? `${item.date} ${item.time}`
                        : formatTime(
                            item.timestamp
                        );


                return `
                    <tr>
                        <td>${timestamp}</td>
                        <td>${item.event || "--"}</td>
                        <td>${item.message || "--"}</td>
                    </tr>
                `;

            }).join("");

    }

    catch (error) {

        console.error(
            "Firebase History Error:",
            error
        );

    }

}


// ======================================================
// ACCESS LOGS
// ======================================================

async function loadAccessLogs() {

    try {

        const response =
            await fetch(
                "/api/access-logs"
            );


        if (!response.ok) {
            return;
        }


        const result =
            await response.json();


        if (!result.success) {
            return;
        }


        if (!accessLogsTable) {
            return;
        }


        const records =
            result.data || [];


        accessLogsTable.innerHTML =
            records.map(item => `
                <tr>
                    <td>
                        ${item.date || "--"}
                        ${item.time || ""}
                    </td>

                    <td>
                        ${item.uid || "--"}
                    </td>

                    <td>
                        ${item.userName || "--"}
                    </td>

                    <td>
                        ${item.status || "--"}
                    </td>
                </tr>
            `).join("");

    }

    catch (error) {

        console.error(
            "Access Logs Error:",
            error
        );

    }

}


// ======================================================
// ALERTS
// ======================================================

async function loadAlerts() {

    try {

        const response =
            await fetch(
                "/api/alerts"
            );


        if (!response.ok) {
            return;
        }


        const result =
            await response.json();


        if (!result.success) {
            return;
        }


        if (!alertsTable) {
            return;
        }


        const records =
            result.data || [];


        alertsTable.innerHTML =
            records.map(item => `
                <tr>
                    <td>
                        ${item.date || "--"}
                        ${item.time || ""}
                    </td>

                    <td>
                        ${item.type || "--"}
                    </td>

                    <td>
                        ${item.message || "--"}
                    </td>
                </tr>
            `).join("");

    }

    catch (error) {

        console.error(
            "Alerts Error:",
            error
        );

    }

}


// ======================================================
// NAVIGATION
// ======================================================

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".nav-link"
        );

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    function showSection(id) {

        sections.forEach(section => {

            section.style.display =
                section.id === id
                    ? "block"
                    : "none";

        });


        links.forEach(link => {

            link.classList.toggle(
                "active",
                link.getAttribute("href") ===
                `#${id}`
            );

        });


        const pageTitle =
            document.getElementById(
                "pageTitle"
            );


        if (pageTitle) {

            const titles = {

                monitoring:
                    "Monitoring",

                history:
                    "History",

                system:
                    "System Information"

            };


            pageTitle.textContent =
                titles[id] ||
                "NetGuard Monitoring";

        }

    }


    links.forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                const id =
                    this.getAttribute(
                        "href"
                    ).substring(1);


                showSection(id);

            }
        );

    });


    showSection("monitoring");

}


// ======================================================
// START SYSTEM
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupNavigation();


        // Load immediately

        loadBlynkData();

        loadFirebaseData();

        loadFirebaseHistory();

        loadAccessLogs();

        loadAlerts();


        // Update Blynk and Firebase every 30 seconds

        setInterval(
            loadBlynkData,
            UPDATE_INTERVAL
        );

        setInterval(
            loadFirebaseData,
            UPDATE_INTERVAL
        );


        // History, logs and alerts every 10 seconds

        setInterval(
            loadFirebaseHistory,
            10000
        );

        setInterval(
            loadAccessLogs,
            10000
        );

        setInterval(
            loadAlerts,
            10000
        );

    }
);