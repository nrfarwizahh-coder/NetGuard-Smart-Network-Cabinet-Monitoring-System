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

const doorStatusLarge =
    document.getElementById("doorStatusLarge");

const doorDescription =
    document.getElementById("doorDescription");

const doorCircle =
    document.getElementById("doorCircle");

const connectionText =
    document.getElementById("connectionText");

const systemConnection =
    document.getElementById("systemConnection");

const lastUpdate =
    document.getElementById("lastUpdate");

const historyTable =
    document.getElementById("historyTable");

const historyDate =
    document.getElementById("historyDate");

const clearHistory =
    document.getElementById("clearHistory");


let dataConnectionState = {
    primary: false,
    storage: false
};


// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(value) {

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

    const date = new Date(Number(timestamp));

    if (isNaN(date.getTime())) {
        return "--";
    }

    return date.toLocaleString("en-MY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}


// ======================================================
// CONNECTION STATUS
// ======================================================

function updateConnectionStatus() {

    const connected =
        dataConnectionState.primary ||
        dataConnectionState.storage;

    if (connectionText) {

        connectionText.textContent =
            connected
                ? "System Connected"
                : "Connection Error";
    }

    if (systemConnection) {

        systemConnection.textContent =
            connected
                ? "Connected"
                : "Disconnected";
    }
}


// ======================================================
// DOOR STATUS
// ======================================================

function updateDoorStatus(status) {

    if (
        status === undefined ||
        status === null ||
        status === ""
    ) {
        return;
    }

    const value =
        String(status)
            .trim()
            .toUpperCase();


    if (
        value === "OPEN" ||
        value === "1" ||
        value === "OPENED"
    ) {

        if (doorStatusElement)
            doorStatusElement.textContent = "OPEN";

        if (doorStatusLarge)
            doorStatusLarge.textContent = "OPEN";

        if (doorDescription)
            doorDescription.textContent =
                "Cabinet door is currently open.";

        if (doorCircle)
            doorCircle.style.background =
                "#fee2e2";

        return;
    }


    if (
        value === "CLOSED" ||
        value === "0" ||
        value === "CLOSE"
    ) {

        if (doorStatusElement)
            doorStatusElement.textContent =
                "CLOSED";

        if (doorStatusLarge)
            doorStatusLarge.textContent =
                "CLOSED";

        if (doorDescription)
            doorDescription.textContent =
                "Cabinet door is securely closed.";

        if (doorCircle)
            doorCircle.style.background =
                "#dcfce7";

        return;
    }


    if (doorStatusElement)
        doorStatusElement.textContent =
            value;

    if (doorStatusLarge)
        doorStatusLarge.textContent =
            value;

    if (doorDescription)
        doorDescription.textContent =
            "Waiting for cabinet door status.";

    if (doorCircle)
        doorCircle.style.background =
            "#f1f5f9";
}


// ======================================================
// UPDATE MONITORING CARDS
// ======================================================

function updateMonitoringCards(data) {

    if (!data) return;


    // ==================================================
    // TEMPERATURE
    // ==================================================

    if (
        data.temperature !== undefined &&
        data.temperature !== null
    ) {

        if (temperatureElement) {

            temperatureElement.textContent =
                formatNumber(data.temperature);
        }
    }


    // ==================================================
    // HUMIDITY
    // ==================================================

    if (
        data.humidity !== undefined &&
        data.humidity !== null
    ) {

        if (humidityElement) {

            humidityElement.textContent =
                formatNumber(data.humidity);
        }
    }


    // ==================================================
    // RFID ACCESS
    // ==================================================

    const currentUser =
        data.currentUser;

    const rfid =
        data.rfidAccess;


    if (rfidAccessElement) {

        if (
            currentUser &&
            currentUser !== "NONE"
        ) {

            rfidAccessElement.textContent =
                currentUser;

        } else if (
            rfid &&
            rfid !== "NONE"
        ) {

            rfidAccessElement.textContent =
                rfid;

        } else if (
            currentUser === "NONE" ||
            rfid === "NONE"
        ) {

            rfidAccessElement.textContent =
                "NONE";
        }
    }


    // ==================================================
    // UNAUTHORIZED ACCESS
    // ==================================================

    if (
        unauthorizedAccessElement &&
        data.unauthorizedAccess !== undefined
    ) {

        unauthorizedAccessElement.textContent =
            data.unauthorizedAccess;
    }


    // ==================================================
    // SECURITY ACCESS
    // ==================================================

    if (
        securityAccessElement &&
        data.securityAccess !== undefined
    ) {

        securityAccessElement.textContent =
            data.securityAccess;
    }


    // ==================================================
    // DOOR STATUS
    // ==================================================

    if (
        data.doorStatus !== undefined &&
        data.doorStatus !== null
    ) {

        updateDoorStatus(
            data.doorStatus
        );
    }


    // ==================================================
    // NETWORK SWITCH
    // ==================================================

    if (switchStatusElement) {

        // Supports both:
        // Blynk/server: switchStatus
        // Firebase: SwitchStatus

        const switchValue =
            data.switchStatus !== undefined
                ? data.switchStatus
                : data.SwitchStatus;


        if (
            String(switchValue) === "1" ||
            String(switchValue).toUpperCase() === "ON"
        ) {

            switchStatusElement.textContent =
                "ON";

        } else if (
            String(switchValue) === "0" ||
            String(switchValue).toUpperCase() === "OFF"
        ) {

            switchStatusElement.textContent =
                "OFF";
        }
    }


    // ==================================================
    // G0/0
    // ======================================================

    const g00Element =
        document.getElementById("g0/0");


    if (g00Element) {

        let g00Value = null;


        // Firebase structure:
        // g0
        //   0
        //     status

        if (
            data.g0 &&
            data.g0[0] &&
            data.g0[0].status !== undefined
        ) {

            g00Value =
                data.g0[0].status;

        }


        // Alternative direct value

        else if (
            data.g00 !== undefined
        ) {

            g00Value =
                data.g00;

        }


        if (String(g00Value) === "1") {

            g00Element.textContent =
                "UP";

        } else if (String(g00Value) === "0") {

            g00Element.textContent =
                "DOWN";

        }
    }


    // ==================================================
    // G0/1
    // ======================================================

    const g01Element =
        document.getElementById("g0/1");


    if (g01Element) {

        let g01Value = null;


        // Firebase structure:
        // g0
        //   1
        //     status

        if (
            data.g0 &&
            data.g0[1] &&
            data.g0[1].status !== undefined
        ) {

            g01Value =
                data.g0[1].status;

        }


        // Alternative direct value

        else if (
            data.g01 !== undefined
        ) {

            g01Value =
                data.g01;

        }


        if (String(g01Value) === "1") {

            g01Element.textContent =
                "UP";

        } else if (String(g01Value) === "0") {

            g01Element.textContent =
                "DOWN";

        }
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
                "Current data API error"
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Current data error"
            );
        }


        updateMonitoringCards(
            result.data
        );


        dataConnectionState.primary =
            true;

        updateConnectionStatus();


        if (
            lastUpdate &&
            result.updatedAt
        ) {

            const time =
                new Date(result.updatedAt);


            if (!isNaN(time.getTime())) {

                lastUpdate.textContent =
                    time.toLocaleTimeString();
            }
        }


    } catch (error) {

        console.error(
            "Current data error:",
            error
        );


        dataConnectionState.primary =
            false;

        updateConnectionStatus();
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

            const errorData =
                await response.json()
                    .catch(() => ({}));


            throw new Error(
                errorData.message ||
                "Stored data API error"
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Stored data error"
            );
        }


        if (!result.data) {

            throw new Error(
                "No current monitoring data found."
            );
        }


        updateMonitoringCards(
            result.data
        );


        dataConnectionState.storage =
            true;

        updateConnectionStatus();


        // Firebase uses lastUpdate
        // instead of timestamp

        const firebaseTimestamp =
            result.data.lastUpdate ||
            result.data.timestamp;


        if (
            lastUpdate &&
            firebaseTimestamp
        ) {

            const time =
                new Date(
                    Number(firebaseTimestamp)
                );


            if (!isNaN(time.getTime())) {

                lastUpdate.textContent =
                    time.toLocaleTimeString();
            }
        }


    } catch (error) {

        console.error(
            "Stored data error:",
            error
        );


        dataConnectionState.storage =
            false;

        updateConnectionStatus();
    }
}


// ======================================================
// HISTORY
// ======================================================

let allHistoryRecords = [];

let selectedHistoryDate = "";


async function loadFirebaseHistory() {

    try {

        const response =
            await fetch("/api/history");


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => ({}));


            throw new Error(
                errorData.message ||
                "History API error"
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "History error"
            );
        }


        const history =
            result.data || {};


        allHistoryRecords =
            Object.entries(history)
                .sort(
                    (a, b) =>
                        Number(b[0]) -
                        Number(a[0])
                );


        if (selectedHistoryDate) {

            filterHistoryByDate(
                selectedHistoryDate
            );

        } else {

            displayHistory(
                allHistoryRecords
            );
        }


    } catch (error) {

        console.error(
            "History error:",
            error
        );


        if (historyTable) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load
                        monitoring history.
                    </td>
                </tr>
            `;
        }
    }
}


// ======================================================
// DISPLAY HISTORY
// ======================================================

function displayHistory(records) {

    if (!historyTable) return;


    if (records.length === 0) {

        historyTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No history found
                    for this date.
                </td>
            </tr>
        `;

        return;
    }


    historyTable.innerHTML =
        records.map(
            ([recordKey, data]) => {

                const timestamp =
                    data.timestamp ||
                    recordKey;


                return `
                    <tr>

                        <td>
                            ${formatTime(timestamp)}
                        </td>

                        <td>
                            ${formatNumber(
                                data.temperature
                            )} °C
                        </td>

                        <td>
                            ${formatNumber(
                                data.humidity
                            )} %
                        </td>

                        <td>
                            ${data.doorStatus ?? "--"}
                        </td>

                        <td>
                            ${data.rfidAccess ?? "--"}
                        </td>

                        <td>
                            ${data.unauthorizedAccess ?? "--"}
                        </td>

                        <td>
                            ${data.securityAccess ?? "--"}
                        </td>

                    </tr>
                `;
            }
        ).join("");
}


// ======================================================
// DATE FILTER
// ======================================================

function filterHistoryByDate(selectedDate) {

    selectedHistoryDate =
        selectedDate;


    if (!selectedDate) {

        displayHistory(
            allHistoryRecords
        );

        return;
    }


    const filteredRecords =
        allHistoryRecords.filter(
            ([recordKey, data]) => {

                const timestamp =
                    data.timestamp ||
                    recordKey;


                const date =
                    new Date(
                        Number(timestamp)
                    );


                if (
                    isNaN(
                        date.getTime()
                    )
                ) {

                    return false;
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


                const recordDate =
                    `${year}-${month}-${day}`;


                return (
                    recordDate ===
                    selectedDate
                );
            }
        );


    displayHistory(
        filteredRecords
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


        const pageTitle =
            document.getElementById(
                "pageTitle"
            );


        const titles = {

            monitoring:
                "Monitoring",

            history:
                "History",

            system:
                "System"
        };


        if (pageTitle) {

            pageTitle.textContent =
                titles[id] ||
                "Monitoring";
        }


        window.history.replaceState(
            null,
            "",
            `#${id}`
        );
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


                    showSection(id);
                }
            );
        }
    );


    const requestedSection =
        window.location.hash.substring(1);


    if (
        requestedSection &&
        [
            "monitoring",
            "history",
            "system"
        ].includes(
            requestedSection
        )
    ) {

        showSection(
            requestedSection
        );

    } else {

        showSection(
            "monitoring"
        );
    }
}


// ======================================================
// INFORMATION POPUP CONTENT
// ======================================================

const infoContent = {

    temperature: {

        icon: "🌡",

        title: "Temperature",

        text:
            "Displays the current temperature inside the network cabinet. Monitoring temperature helps identify conditions that may affect network equipment.",

        details:
            "<strong>Normal:</strong> Below 30°C<br>" +
            "<strong>Warning:</strong> 30°C – 35°C<br>" +
            "<strong>Alarm:</strong> Above 35°C"
    },


    humidity: {

        icon: "💧",

        title: "Humidity",

        text:
            "Displays the current humidity level inside the network cabinet. High humidity can affect electronic equipment and cabinet operating conditions.",

        details:
            "<strong>Unit:</strong> Percentage (%)<br>" +
            "The value is updated automatically during monitoring."
    },


    door: {

        icon: "🚪",

        title: "Door Status",

        text:
            "Shows whether the network cabinet door is currently open or closed.",

        details:
            "<strong>OPEN:</strong> The cabinet door is open.<br>" +
            "<strong>CLOSED:</strong> The cabinet door is securely closed."
    },


    rfid: {

        icon: "🔑",

        title: "RFID Access",

        text:
            "Displays the latest RFID access detected by the cabinet security system. RFID is used to control and monitor cabinet access.",

        details:
            "Authorized access can be recorded as an access event, while unknown or unauthorized cards can be monitored as security events."
    },


    unauthorized: {

        icon: "⚠",

        title: "Unauthorized Access",

        text:
            "Shows the number of unauthorized access attempts detected by the cabinet security system.",

        details:
            "The value helps identify repeated unsuccessful access attempts and supports cabinet security monitoring."
    },


    security: {

        icon: "🛡",

        title: "Security Access",

        text:
            "Shows the current security condition of the network cabinet.",

        details:
            "<strong>SAFE:</strong> No current security concern.<br>" +
            "<strong>WARNING:</strong> A security event requires attention.<br>" +
            "<strong>ALARM:</strong> A serious security event has been detected."
    },


    switch: {

        icon: "🔌",

        title: "Network Switch",

        text:
            "Displays the current ON or OFF status of the network switch connected to the monitoring system.",

        details:
            "<strong>ON:</strong> Network switch is active.<br>" +
            "<strong>OFF:</strong> Network switch is inactive."
    },


    "g0/0": {

        icon: "🔗",

        title: "G0/0 Network Port",

        text:
            "Displays the current status of the G0/0 network port.",

        details:
            "<strong>UP:</strong> The G0/0 network port is active.<br>" +
            "<strong>DOWN:</strong> The G0/0 network port is inactive."
    },


    "g0/1": {

        icon: "🔗",

        title: "G0/1 Network Port",

        text:
            "Displays the current status of the G0/1 network port.",

        details:
            "<strong>UP:</strong> The G0/1 network port is active.<br>" +
            "<strong>DOWN:</strong> The G0/1 network port is inactive."
    },


    camera: {

        icon: "📷",

        title: "Live Camera",

        text:
            "Provides a live visual view of the network cabinet using the ESP32-CAM.",

        details:
            "The camera helps the user visually check the cabinet condition and observe activity around the monitored cabinet."
    }

};


// ======================================================
// INFORMATION MODAL
// ======================================================

function setupInfoModal() {

    const modal =
        document.getElementById(
            "infoModal"
        );

    const overlay =
        document.getElementById(
            "infoModalOverlay"
        );

    const closeButton =
        document.getElementById(
            "modalClose"
        );

    const doneButton =
        document.getElementById(
            "modalDone"
        );

    const title =
        document.getElementById(
            "infoModalTitle"
        );

    const text =
        document.getElementById(
            "infoModalText"
        );

    const icon =
        document.getElementById(
            "infoModalIcon"
        );

    const details =
        document.getElementById(
            "infoModalDetails"
        );


    const buttons =
        document.querySelectorAll(
            "[data-info]"
        );


    function closeModal() {

        if (!modal) return;


        modal.classList.remove(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );
    }


    function openModal(type) {

        const content =
            infoContent[type];


        if (
            !content ||
            !modal
        ) {

            return;
        }


        if (icon) {

            icon.textContent =
                content.icon;
        }


        if (title) {

            title.textContent =
                content.title;
        }


        if (text) {

            text.textContent =
                content.text;
        }


        if (details) {

            details.innerHTML =
                content.details;
        }


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        if (closeButton) {

            closeButton.focus();
        }
    }


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openModal(
                        button.dataset.info
                    );
                }
            );
        }
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );
    }


    if (doneButton) {

        doneButton.addEventListener(
            "click",
            closeModal
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();
            }
        }
    );
}


// ======================================================
// HISTORY EVENTS
// ======================================================

if (historyDate) {

    historyDate.addEventListener(
        "change",
        () => {

            filterHistoryByDate(
                historyDate.value
            );
        }
    );
}


if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        () => {

            selectedHistoryDate =
                "";

            if (historyDate) {

                historyDate.value =
                    "";
            }

            displayHistory(
                allHistoryRecords
            );
        }
    );
}


// ======================================================
// START
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupInfoModal();

        loadBlynkData();

        loadFirebaseData();

        loadFirebaseHistory();


        // Current data every 30 seconds

        setInterval(
            loadBlynkData,
            UPDATE_INTERVAL
        );


        setInterval(
            loadFirebaseData,
            UPDATE_INTERVAL
        );


        // History every 10 seconds

        setInterval(
            loadFirebaseHistory,
            10000
        );

    }
);