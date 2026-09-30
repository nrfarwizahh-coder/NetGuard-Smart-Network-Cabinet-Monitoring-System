// ======================================================
// NETGUARD DASHBOARD
// BLYNK + FIREBASE
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

const doorStatusLarge =
    document.getElementById("doorStatusLarge");

const doorDescription =
    document.getElementById("doorDescription");

const doorCircle =
    document.getElementById("doorCircle");

const connectionText =
    document.getElementById("connectionText");

const lastUpdate =
    document.getElementById("lastUpdate");

const switchStatusElement =
    document.getElementById("switchStatus");


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

const firebaseUnauthorized =
    document.getElementById("firebaseUnauthorized");

const firebaseSecurity =
    document.getElementById("firebaseSecurity");

const firebaseSwitch =
    document.getElementById("firebaseSwitch");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const firebaseTimestamp =
    document.getElementById("firebaseTimestamp");

const historyTable =
    document.getElementById("historyTable");

const historyDate =
    document.getElementById("historyDate");

const clearHistory =
    document.getElementById("clearHistory");

const systemBlynk =
    document.getElementById("systemBlynk");

const systemFirebase =
    document.getElementById("systemFirebase");


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
// FORMAT TIME
// ======================================================

function formatTime(timestamp) {

    if (!timestamp) {
        return "--";
    }

    const date =
        new Date(Number(timestamp));

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
            value || "--";

    if (doorStatusLarge)
        doorStatusLarge.textContent =
            value || "--";

    if (doorDescription)
        doorDescription.textContent =
            "Door status received from Blynk.";
}


// ======================================================
// LOAD BLYNK
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


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        const data =
            result.data;


        // Temperature

        if (temperatureElement)
            temperatureElement.textContent =
                formatNumber(
                    data.temperature
                );


        // Humidity

        if (humidityElement)
            humidityElement.textContent =
                formatNumber(
                    data.humidity
                );


        // RFID

        if (rfidAccessElement)
            rfidAccessElement.textContent =
                data.rfidAccess ?? "--";


        // Unauthorized Access

        if (unauthorizedAccessElement)
            unauthorizedAccessElement.textContent =
                data.unauthorizedAccess ?? "--";


        // Security

        if (securityAccessElement)
            securityAccessElement.textContent =
                data.securityAccess ?? "--";


        // Door

        updateDoorStatus(
            data.doorStatus
        );


        // Switch

        if (switchStatusElement) {

            switchStatusElement.textContent =
                Number(data.switchStatus) === 1
                    ? "ON"
                    : "OFF";

        }


        // Connection

        if (connectionText)
            connectionText.textContent =
                "Blynk Connected";


        if (systemBlynk)
            systemBlynk.textContent =
                "🟢 Connected";


        // Last Update

        if (lastUpdate) {

            const time =
                new Date(
                    result.updatedAt
                );

            lastUpdate.textContent =
                time.toLocaleTimeString();

        }


    } catch (error) {

        console.error(
            "Blynk Error:",
            error
        );


        if (connectionText)
            connectionText.textContent =
                "Blynk Connection Error";


        if (systemBlynk)
            systemBlynk.textContent =
                "🔴 Disconnected";

    }
}


// ======================================================
// LOAD FIREBASE CURRENT
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
                "Firebase API error"
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message
            );

        }


        const data =
            result.data;


        if (!data) {

            throw new Error(
                "Tiada data dalam Firebase /current"
            );

        }


        console.log(
            "Firebase data:",
            data
        );


        // Temperature

        if (firebaseTemperature)
            firebaseTemperature.textContent =
                formatNumber(
                    data.temperature
                );


        // Humidity

        if (firebaseHumidity)
            firebaseHumidity.textContent =
                formatNumber(
                    data.humidity
                );


        // Door

        if (firebaseDoor)
            firebaseDoor.textContent =
                data.doorStatus ?? "--";


        // RFID

        if (firebaseRfid)
            firebaseRfid.textContent =
                data.rfidAccess ?? "--";


        // Unauthorized

        if (firebaseUnauthorized)
            firebaseUnauthorized.textContent =
                data.unauthorizedAccess ?? "--";


        // Security

        if (firebaseSecurity)
            firebaseSecurity.textContent =
                data.securityAccess ?? "--";


        // Switch

        if (firebaseSwitch) {

            firebaseSwitch.textContent =
                Number(data.SwitchStatus) === 1
                    ? "ON"
                    : "OFF";

        }


        // Timestamp

        if (firebaseTimestamp)
            firebaseTimestamp.textContent =
                formatTime(
                    data.timestamp
                );


        // Firebase Status

        if (firebaseStatus)
            firebaseStatus.textContent =
                "🟢 Connected";


        if (systemFirebase)
            systemFirebase.textContent =
                "🟢 Connected";


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        if (firebaseStatus)
            firebaseStatus.textContent =
                "🔴 Error";


        if (systemFirebase)
            systemFirebase.textContent =
                "🔴 Disconnected";

    }
}


// ======================================================
// FIREBASE HISTORY
// ======================================================

let allHistoryRecords = [];


// This remembers the date currently selected
let selectedHistoryDate = "";


// ======================================================
// LOAD FIREBASE HISTORY
// ======================================================

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
                result.message
            );

        }


        const history =
            result.data || {};


        // Save all Firebase history

        allHistoryRecords =
            Object.entries(history)
                .sort(
                    (a, b) =>
                        Number(b[0]) -
                        Number(a[0])
                );


        // ==================================================
        // KEEP DATE FILTER AFTER AUTO REFRESH
        // ==================================================

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
            "Firebase History Error:",
            error
        );


        if (historyTable) {

            historyTable.innerHTML = `
                <tr>
                    <td colspan="7">
                        Failed to load Firebase history.
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

    if (!historyTable)
        return;


    if (records.length === 0) {

        historyTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No history found for this date.
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
// HISTORY DATE FILTER
// ======================================================

function filterHistoryByDate(selectedDate) {

    // Remember selected date

    selectedHistoryDate =
        selectedDate;


    // If no date selected,
    // show all history

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


                if (isNaN(date.getTime())) {
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


                return recordDate === selectedDate;

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


        // Page title

        const pageTitle =
            document.getElementById(
                "pageTitle"
            );


        if (pageTitle) {

            const titles = {

                dashboard:
                    "Dashboard",

                firebase:
                    "Firebase Monitoring",

                history:
                    "Firebase History",

                system:
                    "System Information"

            };


            pageTitle.textContent =
                titles[id] ||
                "NetGuard Dashboard";

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


                    showSection(id);

                }
            );

        }
    );


    showSection("dashboard");

}


// ======================================================
// HISTORY FILTER EVENTS
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


// ======================================================
// CLEAR HISTORY FILTER
// ======================================================

if (clearHistory) {

    clearHistory.addEventListener(
        "click",
        () => {

            // Remove saved date filter

            selectedHistoryDate = "";


            // Clear date input

            if (historyDate) {
                historyDate.value = "";
            }


            // Show all records

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


        // Initial loading

        loadBlynkData();

        loadFirebaseData();

        loadFirebaseHistory();


        // ==================================================
        // BLYNK REFRESH
        // Every 30 seconds
        // ==================================================

        setInterval(
            loadBlynkData,
            UPDATE_INTERVAL
        );


        // ==================================================
        // FIREBASE CURRENT REFRESH
        // Every 30 seconds
        // ==================================================

        setInterval(
            loadFirebaseData,
            UPDATE_INTERVAL
        );


        // ==================================================
        // FIREBASE HISTORY REFRESH
        // Every 10 seconds
        //
        // The selected date will NOT disappear anymore.
        // ==================================================

        setInterval(
            loadFirebaseHistory,
            10000
        );

    }
);