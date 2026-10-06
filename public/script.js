// ======================================================
// NETGUARD SMART NETWORK CABINET MONITORING
// BLYNK + FIREBASE SYNCHRONIZED
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

const systemConnection =
    document.getElementById("systemConnection");

const systemBlynk =
    document.getElementById("systemBlynk");

const systemFirebase =
    document.getElementById("systemFirebase");

const historyTable =
    document.getElementById("historyTable");

const historyDate =
    document.getElementById("historyDate");

const clearHistoryButton =
    document.getElementById("clearHistory");


// ======================================================
// DOOR ELEMENTS
// ======================================================

const doorStatusLarge =
    document.getElementById("doorStatusLarge");

const doorDescription =
    document.getElementById("doorDescription");

const doorCircle =
    document.getElementById("doorCircle");


// ======================================================
// OPTIONAL ETHERNET ELEMENTS
// ======================================================

const ethernetE0 =
    document.getElementById("ethernetE0");

const ethernetE1 =
    document.getElementById("ethernetE1");


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
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {

    const number =
        parseFloat(value);

    if (isNaN(number)) {
        return "--";
    }

    return number.toFixed(1);
}


// ======================================================
// SET STATUS
// ======================================================

function setStatus(element, status) {

    if (!element) {
        return;
    }

    if (
        status === null ||
        status === undefined ||
        status === ""
    ) {

        element.textContent =
            "--";

        return;
    }


    let value =
        String(status)
            .trim()
            .toUpperCase();


    if (value === "1") {
        value = "ON";
    }

    else if (value === "0") {
        value = "OFF";
    }


    element.textContent =
        value;
}


// ======================================================
// DOOR STATUS
// ======================================================

function updateDoorStatus(status) {

    const value =
        String(status || "")
            .trim()
            .toUpperCase();


    if (
        value === "OPEN" ||
        value === "1" ||
        value === "OPENED"
    ) {

        if (doorStatusElement) {
            doorStatusElement.textContent =
                "OPEN";
        }

        if (doorStatusLarge) {
            doorStatusLarge.textContent =
                "OPEN";
        }

        if (doorDescription) {
            doorDescription.textContent =
                "Cabinet door is currently open.";
        }

        if (doorCircle) {
            doorCircle.style.background =
                "#fee2e2";
        }

        return;
    }


    if (
        value === "CLOSED" ||
        value === "0" ||
        value === "CLOSE"
    ) {

        if (doorStatusElement) {
            doorStatusElement.textContent =
                "CLOSED";
        }

        if (doorStatusLarge) {
            doorStatusLarge.textContent =
                "CLOSED";
        }

        if (doorDescription) {
            doorDescription.textContent =
                "Cabinet door is securely closed.";
        }

        if (doorCircle) {
            doorCircle.style.background =
                "#dcfce7";
        }

        return;
    }


    if (doorStatusElement) {
        doorStatusElement.textContent =
            value || "--";
    }

    if (doorStatusLarge) {
        doorStatusLarge.textContent =
            value || "--";
    }

    if (doorDescription) {
        doorDescription.textContent =
            "Door status received from NetGuard.";
    }
}


// ======================================================
// UPDATE NETWORK SWITCH
// ======================================================

function updateNetworkSwitch(data) {

    const port0 =
        Number(
            data?.g0?.[0]?.status
        );

    const port1 =
        Number(
            data?.g0?.[1]?.status
        );


    // ==================================================
    // G0/0
    // ==================================================

    if (g00Element) {

        if (port0 === 1) {

            g00Element.textContent =
                "UP";

        }

        else if (port0 === 0) {

            g00Element.textContent =
                "DOWN";

        }

        else {

            g00Element.textContent =
                "--";

        }
    }


    // ==================================================
    // G0/1
    // ==================================================

    if (g01Element) {

        if (port1 === 1) {

            g01Element.textContent =
                "UP";

        }

        else if (port1 === 0) {

            g01Element.textContent =
                "DOWN";

        }

        else {

            g01Element.textContent =
                "--";

        }
    }


    // ==================================================
    // NETWORK SWITCH
    // ==================================================

    if (switchStatusElement) {

        if (
            port0 === 1 ||
            port1 === 1
        ) {

            switchStatusElement.textContent =
                "ON";

        }

        else if (
            port0 === 0 &&
            port1 === 0
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
    // OPTIONAL ETHERNET E0
    // ==================================================

    if (ethernetE0) {

        if (port0 === 1) {

            ethernetE0.textContent =
                "ON";

        }

        else if (port0 === 0) {

            ethernetE0.textContent =
                "OFF";

        }

        else {

            ethernetE0.textContent =
                "--";

        }
    }


    // ==================================================
    // OPTIONAL ETHERNET E1
    // ==================================================

    if (ethernetE1) {

        if (port1 === 1) {

            ethernetE1.textContent =
                "ON";

        }

        else if (port1 === 0) {

            ethernetE1.textContent =
                "OFF";

        }

        else {

            ethernetE1.textContent =
                "--";

        }
    }
}


// ======================================================
// UPDATE MONITORING CARDS
// ======================================================

function updateMonitoringCards(data) {

    if (!data) {
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

        if (
            data.temperature !== undefined &&
            data.temperature !== null
        ) {

            temperatureElement.textContent =
                formatNumber(
                    data.temperature
                );

        }

        else {

            temperatureElement.textContent =
                "--";

        }
    }


    // ==================================================
    // HUMIDITY
    // ==================================================

    if (humidityElement) {

        if (
            data.humidity !== undefined &&
            data.humidity !== null
        ) {

            humidityElement.textContent =
                Number(
                    data.humidity
                ).toFixed(0);

        }

        else {

            humidityElement.textContent =
                "--";

        }
    }


    // ==================================================
    // DOOR
    // ==================================================

    if (
        data.doorStatus !== undefined
    ) {

        updateDoorStatus(
            data.doorStatus
        );

    }


    // ==================================================
    // RFID
    // ==================================================

    if (rfidAccessElement) {

        rfidAccessElement.textContent =
            data.rfidAccess ??
            "--";

    }


    // ==================================================
    // UNAUTHORIZED ACCESS
    // ==================================================

    if (unauthorizedAccessElement) {

        unauthorizedAccessElement.textContent =
            data.unauthorizedAccess ??
            "--";

    }


    // ==================================================
    // SECURITY ACCESS
    // ==================================================

    if (securityAccessElement) {

        securityAccessElement.textContent =
            data.securityAccess ??
            "--";

    }


    // ==================================================
    // NETWORK SWITCH
    // ==================================================

    updateNetworkSwitch(
        data
    );


    // ==================================================
    // LAST UPDATE
    // ==================================================

    if (lastUpdateElement) {

        lastUpdateElement.textContent =
            new Date().toLocaleTimeString();

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
                "Blynk API error"
            );

        }


        const result =
            await response.json();


        console.log(
            "Blynk API result:",
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


        updateMonitoringCards(
            data
        );


        if (systemBlynk) {

            systemBlynk.textContent =
                "🟢 Connected";

        }

    }

    catch (error) {

        console.error(
            "Blynk fetch error:",
            error
        );


        if (systemBlynk) {

            systemBlynk.textContent =
                "🔴 Disconnected";

        }

    }
}


// ======================================================
// LOAD FIREBASE CURRENT DATA
// ======================================================

async function loadFirebaseData() {

    try {

        const response =
            await fetch("/api/firebase");


        if (!response.ok) {

            throw new Error(
                "Firebase API error"
            );

        }


        const result =
            await response.json();


        console.log(
            "Firebase API result:",
            result
        );


        if (
            !result.success ||
            !result.data
        ) {

            throw new Error(
                result.message ||
                "Firebase data unavailable"
            );

        }


        const data =
            result.data;


        console.log(
            "Firebase current data:",
            data
        );


        updateMonitoringCards(
            data
        );


        if (systemFirebase) {

            systemFirebase.textContent =
                "🟢 Connected";

        }

    }

    catch (error) {

        console.error(
            "Firebase fetch error:",
            error
        );


        if (systemFirebase) {

            systemFirebase.textContent =
                "🔴 Disconnected";

        }

    }
}


// ======================================================
// LOAD ALL DATA
// ======================================================

async function loadAllData() {

    await Promise.all([
        loadBlynkData(),
        loadFirebaseData()
    ]);

}


// ======================================================
// HISTORY VALUE
// ======================================================

function getHistoryValue(
    record,
    names
) {

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
// FORMAT HISTORY TIME
// ======================================================

function formatHistoryTime(record) {

    const dateValue =
        record.date;

    const timeValue =
        record.time;


    // If Firebase has separate date and time
    if (
        dateValue !== undefined &&
        dateValue !== null &&
        dateValue !== "" &&
        timeValue !== undefined &&
        timeValue !== null &&
        timeValue !== ""
    ) {

        return `${dateValue} ${timeValue}`;

    }


    const value =
        getHistoryValue(
            record,
            [
                "timestamp",
                "dateTime",
                "datetime",
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


    if (
        typeof value === "number" ||
        !isNaN(Number(value))
    ) {

        const numberValue =
            Number(value);


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


    const date =
        new Date(value);


    if (!isNaN(date.getTime())) {

        return date.toLocaleString();

    }


    return String(value);

}


// ======================================================
// LOAD FIREBASE HISTORY
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
                "History API error"
            );

        }


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
                : Object.values(
                    result.data
                );


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
                records.filter(
                    record => {

                        const dateValue =
                            record.date;


                        if (
                            dateValue !== undefined &&
                            dateValue !== null &&
                            dateValue !== ""
                        ) {

                            return String(
                                dateValue
                            ).startsWith(
                                selectedDate
                            );

                        }


                        const timeValue =
                            getHistoryValue(
                                record,
                                [
                                    "timestamp",
                                    "dateTime",
                                    "datetime",
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
                                        Number(timeValue) <
                                        10000000000
                                            ? Number(timeValue) *
                                              1000
                                            : Number(timeValue)
                                      )
                                    : timeValue
                            );


                        if (
                            isNaN(
                                date.getTime()
                            )
                        ) {

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
                            ).padStart(
                                2,
                                "0"
                            );


                        const day =
                            String(
                                date.getDate()
                            ).padStart(
                                2,
                                "0"
                            );


                        const formattedDate =
                            `${year}-${month}-${day}`;


                        return (
                            formattedDate ===
                            selectedDate
                        );

                    }
                );

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


        historyTable.innerHTML =
            "";


        // ==================================================
        // DISPLAY HISTORY
        // ==================================================

        records.forEach(
            record => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const time =
                    formatHistoryTime(
                        record
                    );


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


                historyTable.appendChild(
                    row
                );

            }
        );


    }

    catch (error) {

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

                historyDate.value =
                    "";

            }

            loadHistory();

        }
    );

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

        sections.forEach(
            section => {

                section.style.display =
                    section.id === id
                        ? "block"
                        : "none";

            }
        );


        links.forEach(
            link => {

                link.classList.toggle(
                    "active",

                    link.getAttribute(
                        "href"
                    ) === `#${id}`

                );

            }
        );


        const titles = {

            monitoring:
                "Monitoring",

            history:
                "History",

            system:
                "System Information"

        };


        if (pageTitle) {

            pageTitle.textContent =
                titles[id] ||
                "NetGuard Dashboard";

        }


        // ----------------------------------------------
        // Load required data
        // ----------------------------------------------

        if (id === "history") {

            loadHistory();

        }


        if (id === "system") {

            updateSystemStatus();

        }

    }


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const id =
                        this.getAttribute(
                            "href"
                        ).substring(1);


                    showSection(
                        id
                    );

                }
            );

        }
    );


    // Start with Monitoring page

    showSection(
        "monitoring"
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
            await fetch(
                "/api/firebase"
            );


        const firebaseResult =
            await firebaseResponse.json();


        if (
            firebaseResult.success
        ) {

            systemConnection.textContent =
                "Firebase: Connected";

        }

        else {

            systemConnection.textContent =
                "Firebase: Error";

        }

    }

    catch (error) {

        console.error(
            "System status error:",
            error
        );


        systemConnection.textContent =
            "System connection error";

    }

}


// ======================================================
// LOGOUT
// ======================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


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
// INFORMATION POPUP
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "NetGuard Info Popup Loaded"
        );


        const infoModal =
            document.getElementById(
                "infoModal"
            );

        const infoModalTitle =
            document.getElementById(
                "infoModalTitle"
            );

        const infoModalText =
            document.getElementById(
                "infoModalText"
            );

        const infoModalDetails =
            document.getElementById(
                "infoModalDetails"
            );

        const infoModalIcon =
            document.getElementById(
                "infoModalIcon"
            );

        const modalClose =
            document.getElementById(
                "modalClose"
            );

        const modalDone =
            document.getElementById(
                "modalDone"
            );

        const infoModalOverlay =
            document.getElementById(
                "infoModalOverlay"
            );


        // ==================================================
        // INFORMATION CONTENT
        // ==================================================

        const infoContent = {

            camera: {
                icon: "📷",
                title: "Live Camera",
                text:
                    "Provides live visual monitoring of the network cabinet.",
                details:
                    "The ESP32-CAM allows the user to visually check the condition of the network cabinet remotely."
            },

            temperature: {
                icon: "🌡️",
                title: "Temperature",
                text:
                    "Displays the current temperature inside the network cabinet.",
                details:
                    "The DHT22 sensor monitors the temperature inside the network cabinet."
            },

            humidity: {
                icon: "💧",
                title: "Humidity",
                text:
                    "Displays the current humidity level inside the network cabinet.",
                details:
                    "The DHT22 sensor monitors humidity inside the network cabinet."
            },

            door: {
                icon: "🚪",
                title: "Door Status",
                text:
                    "Shows the current condition of the network cabinet door.",
                details:
                    "CLOSED means the cabinet is secured. OPEN means the cabinet door has been opened."
            },

            rfid: {
                icon: "🔑",
                title: "RFID Access",
                text:
                    "Displays the latest RFID access detected by the system.",
                details:
                    "The RFID RC522 reader is used to identify authorized users."
            },

            unauthorized: {
                icon: "⚠️",
                title: "Unauthorized Access",
                text:
                    "Displays the number of unauthorized access attempts.",
                details:
                    "The system records unsuccessful RFID access attempts."
            },

            security: {
                icon: "🛡️",
                title: "Security Access",
                text:
                    "Displays the current security level of the network cabinet.",
                details:
                    "SAFE indicates normal operation. WARNING or ALARM indicates a security condition."
            },

            switch: {
                icon: "🔌",
                title: "Network Switch",
                text:
                    "Displays the overall status of the network switch.",
                details:
                    "The system monitors the connected network switch and its monitored ports."
            },

            "g0/0": {
                icon: "🔗",
                title: "G0/0",
                text:
                    "Displays the current status of the G0/0 network port.",
                details:
                    "UP means the G0/0 interface is active. DOWN means the interface is inactive."
            },

            "g0/1": {
                icon: "🔗",
                title: "G0/1",
                text:
                    "Displays the current status of the G0/1 network port.",
                details:
                    "UP means the G0/1 interface is active. DOWN means the interface is inactive."
            }

        };


        // ==================================================
        // INFO BUTTONS
        // ==================================================

        const infoButtons =
            document.querySelectorAll(
                ".info-button"
            );


        infoButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const type =
                            button.getAttribute(
                                "data-info"
                            );


                        const info =
                            infoContent[type];


                        if (!info) {

                            console.error(
                                "No information found for:",
                                type
                            );

                            return;

                        }


                        if (infoModalIcon) {

                            infoModalIcon.textContent =
                                info.icon;

                        }


                        if (infoModalTitle) {

                            infoModalTitle.textContent =
                                info.title;

                        }


                        if (infoModalText) {

                            infoModalText.textContent =
                                info.text;

                        }


                        if (infoModalDetails) {

                            infoModalDetails.textContent =
                                info.details;

                        }


                        if (infoModal) {

                            infoModal.style.display =
                                "flex";

                            infoModal.setAttribute(
                                "aria-hidden",
                                "false"
                            );

                        }

                    }
                );

            }
        );


        // ==================================================
        // CLOSE MODAL
        // ==================================================

        function closeInfoModal() {

            if (!infoModal) {
                return;
            }


            infoModal.style.display =
                "none";


            infoModal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        if (modalClose) {

            modalClose.addEventListener(
                "click",
                closeInfoModal
            );

        }


        if (modalDone) {

            modalDone.addEventListener(
                "click",
                closeInfoModal
            );

        }


        if (infoModalOverlay) {

            infoModalOverlay.addEventListener(
                "click",
                closeInfoModal
            );

        }


        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Escape"
                ) {

                    closeInfoModal();

                }

            }
        );

    }
);


// ======================================================
// START NETGUARD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupNavigation();

        loadAllData();

        loadHistory();


        setInterval(
            loadAllData,
            UPDATE_INTERVAL
        );


        setInterval(
            loadHistory,
            UPDATE_INTERVAL
        );

    }
);