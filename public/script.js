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


        navLinks.forEach(item => {
            item.classList.remove("active");
        });


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


        // G0/0

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


        // G0/1

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


        // NETWORK SWITCH

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

    await Promise.all([
        loadFirebaseData(),
        loadBlynkData()
    ]);

}


// ======================================================
// HISTORY
// ======================================================

// Get a value using several possible Firebase field names

function getHistoryValue(record, names) {

    for (const name of names) {

        if (
            record[name] !== undefined &&
            record[name] !== null &&
            record[name] !== ""
        ) {

            return record[name];

        }

    }

    return null;

}


// ======================================================
// FORMAT HISTORY DATE/TIME
// ======================================================

function formatHistoryTime(record) {

    const value =
        getHistoryValue(
            record,
            [
                "time",
                "timestamp",
                "dateTime",
                "datetime",
                "date",
                "createdAt"
            ]
        );


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "--";

    }


    // Firebase timestamp number

    if (
        typeof value === "number" ||
        !isNaN(Number(value))
    ) {

        const numberValue =
            Number(value);


        // Firebase timestamps are normally milliseconds.
        // If it is a smaller value, convert seconds to milliseconds.

        const date =
            new Date(
                numberValue < 10000000000
                    ? numberValue * 1000
                    : numberValue
            );


        if (!isNaN(date.getTime())) {

            return date.toLocaleString();

        }

    }


    // Date string

    const date =
        new Date(value);


    if (!isNaN(date.getTime())) {

        return date.toLocaleString();

    }


    return String(value);

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


        console.log(
            "History records:",
            records
        );


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

                    const timeValue =
                        getHistoryValue(
                            record,
                            [
                                "time",
                                "timestamp",
                                "dateTime",
                                "datetime",
                                "date",
                                "createdAt"
                            ]
                        );


                    if (
                        timeValue === null ||
                        timeValue === undefined
                    ) {

                        return false;

                    }


                    const date =
                        new Date(
                            Number(timeValue)
                                ? (
                                    Number(timeValue) < 10000000000
                                        ? Number(timeValue) * 1000
                                        : Number(timeValue)
                                  )
                                : timeValue
                        );


                    if (isNaN(date.getTime())) {

                        return String(
                            timeValue
                        ).startsWith(
                            selectedDate
                        );

                    }


                    const year =
                        date.getFullYear();

                    const month =
                        String(
                            date.getMonth() + 1
                        ).padStart(2, "0");

                    const day =
                        String(
                            date.getDate()
                        ).padStart(2, "0");


                    const formattedDate =
                        `${year}-${month}-${day}`;


                    return formattedDate === selectedDate;

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


        // ==================================================
        // DISPLAY RECORDS
        // ==================================================

        records.forEach(record => {

            const row =
                document.createElement("tr");


            const time =
                formatHistoryTime(record);


            const temperature =
                getHistoryValue(
                    record,
                    [
                        "temperature",
                        "temp"
                    ]
                );


            const humidity =
                getHistoryValue(
                    record,
                    [
                        "humidity",
                        "humid"
                    ]
                );


            const door =
                getHistoryValue(
                    record,
                    [
                        "door",
                        "doorStatus",
                        "door_status"
                    ]
                );


            const rfid =
                getHistoryValue(
                    record,
                    [
                        "rfid",
                        "rfidAccess",
                        "rfid_access"
                    ]
                );


            const unauthorized =
                getHistoryValue(
                    record,
                    [
                        "unauthorized",
                        "unauthorizedAccess",
                        "unauthorized_access"
                    ]
                );


            const security =
                getHistoryValue(
                    record,
                    [
                        "security",
                        "securityAccess",
                        "security_access"
                    ]
                );


            row.innerHTML = `

                <td>
                    ${time}
                </td>

                <td>
                    ${temperature ?? "--"}
                </td>

                <td>
                    ${humidity ?? "--"}
                </td>

                <td>
                    ${door ?? "--"}
                </td>

                <td>
                    ${rfid ?? "--"}
                </td>

                <td>
                    ${unauthorized ?? "--"}
                </td>

                <td>
                    ${security ?? "--"}
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
// INFO BUTTONS
// ======================================================

function showInfo(type) {

    const info = {

        temperature: {
            title: "Temperature",
            text: "Displays the current temperature inside the network cabinet. This helps monitor the cabinet environment and identify high temperature conditions."
        },

        humidity: {
            title: "Humidity",
            text: "Displays the current humidity level inside the network cabinet. Monitoring humidity helps protect network equipment from environmental conditions."
        },

        door: {
            title: "Door Status",
            text: "Shows the current condition of the network cabinet door. CLOSED means the cabinet is secured, while OPEN means the cabinet door has been opened."
        },

        rfid: {
            title: "RFID Access",
            text: "Displays the latest RFID access detected by the system. The RFID reader is used to identify users who access the network cabinet."
        },

        unauthorized: {
            title: "Unauthorized Access",
            text: "Shows the number of unauthorized access attempts detected by the system."
        },

        security: {
            title: "Security Access",
            text: "Displays the current security level of the network cabinet. SAFE indicates normal operation, while WARNING or ALARM indicates a security issue."
        },

        switch: {
            title: "Network Switch",
            text: "Shows the overall status of the network switch. ON means at least one monitored network port is active."
        },

        g00: {
            title: "G0/0",
            text: "Displays the current status of the G0/0 network switch port. UP means the port is active, while DOWN means the port is inactive."
        },

        g01: {
            title: "G0/1",
            text: "Displays the current status of the G0/1 network switch port. UP means the port is active, while DOWN means the port is inactive."
        }

    };


    const selectedInfo =
        info[type];


    if (!selectedInfo) {
        return;
    }


    alert(
        selectedInfo.title +
        "\n\n" +
        selectedInfo.text
    );

}


// ======================================================
// START
// ======================================================

loadAllData();


setInterval(
    loadAllData,
    UPDATE_INTERVAL
);