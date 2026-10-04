// ======================================================
// NETGUARD SMART NETWORK CABINET MONITORING
// ======================================================

const UPDATE_INTERVAL = 30000;


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

const historyDate =
    document.getElementById("historyDate");

const clearHistoryButton =
    document.getElementById("clearHistory");


// ======================================================
// SECTIONS
// ======================================================

const monitoringSection =
    document.getElementById("monitoring");

const historySection =
    document.getElementById("history");

const systemSection =
    document.getElementById("system");

const pageTitle =
    document.getElementById("pageTitle");


// ======================================================
// LOAD FIREBASE DATA
// ======================================================

async function loadFirebaseData() {

    try {

        const response =
            await fetch("/api/firebase");

        const result =
            await response.json();

        console.log("Firebase API result:", result);


        if (
            result.success &&
            result.data
        ) {

            updateMonitoringCards(result.data);

        } else {

            console.error(
                "Firebase data error:",
                result
            );

            if (connectionText) {
                connectionText.textContent =
                    "Firebase Error";
            }

        }

    } catch (error) {

        console.error(
            "Firebase fetch error:",
            error
        );

        if (connectionText) {
            connectionText.textContent =
                "Connection Error";
        }

    }

}


// ======================================================
// NAVIGATION
// ======================================================

const navLinks =
    document.querySelectorAll(".nav-link");


navLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();


        // Remove active from all links

        navLinks.forEach(item => {
            item.classList.remove("active");
        });


        // Add active to clicked link

        this.classList.add("active");


        const target =
            this.getAttribute("href");


        // ==================================================
        // MONITORING
        // ==================================================

        if (target === "#monitoring") {

            monitoringSection.style.display = "block";

            historySection.style.display = "none";

            systemSection.style.display = "none";

            pageTitle.textContent =
                "Monitoring";

            loadAllData();

        }


        // ==================================================
        // HISTORY
        // ==================================================

        else if (target === "#history") {

            monitoringSection.style.display = "none";

            historySection.style.display = "block";

            systemSection.style.display = "none";

            pageTitle.textContent =
                "History";

            loadHistory();

        }


        // ==================================================
        // SYSTEM
        // ==================================================

        else if (target === "#system") {

            monitoringSection.style.display = "none";

            historySection.style.display = "none";

            systemSection.style.display = "block";

            pageTitle.textContent =
                "System";

            updateSystemStatus();

        }

    });

});


// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "login.html";

        }
    );

}


// ======================================================
// UPDATE MONITORING CARDS
// ======================================================

function updateMonitoringCards(data) {

    console.log(
        "Monitoring data:",
        data
    );


    if (!data) {

        console.log(
            "No monitoring data received."
        );

        return;
    }


    // ==================================================
    // TEMPERATURE
    // ==================================================

    if (
        data.temperature !== undefined &&
        data.temperature !== null
    ) {

        temperatureElement.textContent =
            Number(data.temperature).toFixed(1);

    } else {

        temperatureElement.textContent =
            "--";

    }


    // ==================================================
    // HUMIDITY
    // ==================================================

    if (
        data.humidity !== undefined &&
        data.humidity !== null
    ) {

        humidityElement.textContent =
            Number(data.humidity).toFixed(0);

    } else {

        humidityElement.textContent =
            "--";

    }


    // ==================================================
    // DOOR STATUS
    // ==================================================

    if (data.doorStatus !== undefined) {

        const door =
            String(data.doorStatus).toUpperCase();


        if (
            door === "OPEN" ||
            door === "OPENED" ||
            door === "1"
        ) {

            doorStatusElement.textContent =
                "OPEN";

        } else {

            doorStatusElement.textContent =
                "CLOSED";

        }

    } else {

        doorStatusElement.textContent =
            "--";

    }


    // ==================================================
    // RFID ACCESS
    // ==================================================

    if (data.rfidAccess !== undefined) {

        rfidAccessElement.textContent =
            data.rfidAccess;

    } else {

        rfidAccessElement.textContent =
            "--";

    }


    // ==================================================
    // UNAUTHORIZED ACCESS
    // ==================================================

    if (data.unauthorizedAccess !== undefined) {

        unauthorizedAccessElement.textContent =
            data.unauthorizedAccess;

    } else {

        unauthorizedAccessElement.textContent =
            "--";

    }


    // ==================================================
    // SECURITY ACCESS
    // ==================================================

    if (data.securityAccess !== undefined) {

        securityAccessElement.textContent =
            data.securityAccess;

    } else {

        securityAccessElement.textContent =
            "--";

    }


    // ==================================================
    // NETWORK SWITCH
    // ==================================================

    const switchData =
        data.switchStatus;


    console.log(
        "Switch Firebase data:",
        switchData
    );


    if (
        switchData &&
        typeof switchData === "object"
    ) {

        const port0 =
            Number(
                switchData["0 status"]
            );

        const port1 =
            Number(
                switchData["1 status"]
            );


        console.log(
            "G0/0:",
            port0
        );

        console.log(
            "G0/1:",
            port1
        );


        // ==================================================
        // G0/0
        // ==================================================

        if (port0 === 1) {

            g00Element.textContent =
                "UP";

        } else if (port0 === 0) {

            g00Element.textContent =
                "DOWN";

        } else {

            g00Element.textContent =
                "--";

        }


        // ==================================================
        // G0/1
        // ==================================================

        if (port1 === 1) {

            g01Element.textContent =
                "UP";

        } else if (port1 === 0) {

            g01Element.textContent =
                "DOWN";

        } else {

            g01Element.textContent =
                "--";

        }


        // ==================================================
        // NETWORK SWITCH
        // ==================================================

        if (
            port0 === 1 ||
            port1 === 1
        ) {

            switchStatusElement.textContent =
                "ON";

        } else if (
            port0 === 0 &&
            port1 === 0
        ) {

            switchStatusElement.textContent =
                "OFF";

        } else {

            switchStatusElement.textContent =
                "--";

        }

    } else {

        switchStatusElement.textContent =
            "--";

        g00Element.textContent =
            "--";

        g01Element.textContent =
            "--";

    }


    // ==================================================
    // LAST UPDATE
    // ==================================================

    if (lastUpdateElement) {

        lastUpdateElement.textContent =
            new Date().toLocaleTimeString();

    }


    // ==================================================
    // CONNECTION
    // ==================================================

    if (connectionText) {

        connectionText.textContent =
            "Connected";

    }

}


// ======================================================
// BLYNK DATA
// ======================================================

async function loadBlynkData() {

    try {

        const response =
            await fetch("/api/data");

        const result =
            await response.json();

        console.log(
            "Blynk API result:",
            result
        );

    } catch (error) {

        console.error(
            "Blynk fetch error:",
            error
        );

    }

}


// ======================================================
// LOAD ALL DATA
// ======================================================

async function loadAllData() {

    console.log(
        "Loading NetGuard data..."
    );


    await Promise.all([
        loadFirebaseData(),
        loadBlynkData()
    ]);

}


// ======================================================
// HISTORY
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

        const result =
            await response.json();

        console.log(
            "History API result:",
            result
        );


        if (
            !result.success ||
            !result.data
        ) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No history data available.
                    </td>
                </tr>
            `;

            return;

        }


        let records =
            Array.isArray(result.data)
                ? result.data
                : Object.values(result.data);


        // ==================================================
        // DATE FILTER
        // ==================================================

        if (
            historyDate &&
            historyDate.value
        ) {

            const selectedDate =
                historyDate.value;


            records =
                records.filter(record => {

                    if (!record.time) {
                        return false;
                    }

                    return String(
                        record.time
                    ).startsWith(
                        selectedDate
                    );

                });

        }


        if (records.length === 0) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        No history data available.
                    </td>
                </tr>
            `;

            return;

        }


        historyTable.innerHTML = "";


        records.forEach(record => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${record.time ?? "--"}
                </td>

                <td>
                    ${record.temperature ?? "--"}
                </td>

                <td>
                    ${record.humidity ?? "--"}
                </td>

                <td>
                    ${record.door ?? "--"}
                </td>

                <td>
                    ${record.rfid ?? "--"}
                </td>

                <td>
                    ${record.unauthorized ?? "--"}
                </td>

                <td>
                    ${record.security ?? "--"}
                </td>

            `;


            historyTable.appendChild(row);

        });


    } catch (error) {

        console.error(
            "History error:",
            error
        );


        historyTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Failed to load history.
                </td>
            </tr>
        `;

    }

}


// ======================================================
// HISTORY DATE SEARCH
// ======================================================

if (historyDate) {

    historyDate.addEventListener(
        "change",
        loadHistory
    );

}


// ======================================================
// CLEAR HISTORY SEARCH
// ======================================================

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        function() {

            if (historyDate) {
                historyDate.value = "";
            }

            loadHistory();

        }
    );

}


// ======================================================
// SYSTEM STATUS
// ======================================================

async function updateSystemStatus() {

    if (!systemConnection) {
        return;
    }


    systemConnection.textContent =
        "Checking system connection...";


    try {

        const firebaseResponse =
            await fetch("/api/firebase");

        const firebaseResult =
            await firebaseResponse.json();


        if (firebaseResult.success) {

            systemConnection.textContent =
                "Firebase: Connected";

        } else {

            systemConnection.textContent =
                "Firebase: Error";

        }

    } catch (error) {

        console.error(
            "System status error:",
            error
        );


        systemConnection.textContent =
            "System connection error";

    }

}


// ======================================================
// START
// ======================================================

loadAllData();


setInterval(
    loadAllData,
    UPDATE_INTERVAL
);