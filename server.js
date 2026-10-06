const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BLYNK_AUTH_TOKEN = process.env.BLYNK_AUTH_TOKEN;

const FIREBASE_DATABASE_URL =
    "https://netguard-814d7-default-rtdb.asia-southeast1.firebasedatabase.app";

let firebaseReady = false;
let database = null;

// ======================================================
// FIREBASE INITIALIZATION
// ======================================================

try {
    const serviceAccount = require(
        path.join(__dirname, "firebase-service-account.json")
    );

    admin.initializeApp({
        credential: admin.cert(serviceAccount),
        databaseURL: FIREBASE_DATABASE_URL
    });

    database = getDatabase();
    firebaseReady = true;

    console.log("Firebase: READY");

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error.message
    );
}

// ======================================================
// BLYNK CHECK
// ======================================================

if (!BLYNK_AUTH_TOKEN) {

    console.error(
        "ERROR: BLYNK_AUTH_TOKEN tidak dijumpai dalam .env"
    );

    process.exit(1);
}

// ======================================================
// STATIC WEBSITE
// ======================================================

app.use(express.static(path.join(__dirname, "public")));

// ======================================================
// BLYNK API
// ======================================================

async function getBlynkValue(pin) {

    const url =
        `https://blynk.cloud/external/api/get?token=${encodeURIComponent(
            BLYNK_AUTH_TOKEN
        )}&${pin}`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Blynk API error ${pin}: ${response.status}`
        );
    }

    return await response.text();
}

// ======================================================
// GET BLYNK DATA
// V0 = Temperature
// V1 = Humidity
// V2 = RFID Access
// V3 = RFID UID
// V4 = Failed Attempts
// V5 = Security State
// V6 = Ethernet E0
// V7 = Ethernet E1
// ======================================================

app.get("/api/data", async (req, res) => {

    try {

        const [
            temperature,
            humidity,
            accessStatus,
            uid,
            failedAttempts,
            securityState,
            ethernetE0,
            ethernetE1
        ] = await Promise.all([

            getBlynkValue("V0"),
            getBlynkValue("V1"),
            getBlynkValue("V2"),
            getBlynkValue("V3"),
            getBlynkValue("V4"),
            getBlynkValue("V5"),
            getBlynkValue("V6"),
            getBlynkValue("V7")

        ]);

        res.json({

            success: true,

            data: {

                temperature,
                humidity,

                rfid: {
                    status: accessStatus,
                    uid: uid
                },

                security: {
                    failedAttempts: failedAttempts,
                    status: securityState
                },

                ethernet: {
                    E0: ethernetE0,
                    E1: ethernetE1
                }

            },

            updatedAt: new Date().toISOString()

        });

    } catch (error) {

        console.error(
            "Blynk Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan data daripada Blynk.",

            error:
                error.message

        });

    }

});

// ======================================================
// FIREBASE CURRENT DATA
// ======================================================

app.get("/api/firebase", async (req, res) => {

    try {

        if (!firebaseReady || !database) {

            return res.status(500).json({

                success: false,

                message:
                    "Firebase belum berjaya initialize."

            });

        }

        const [

            currentSnapshot,
            sensorSnapshot

        ] = await Promise.all([

            database.ref("current").once("value"),

            database.ref("sensors").once("value")

        ]);

        const current =
            currentSnapshot.val() || {};

        const sensors =
            sensorSnapshot.val() || {};

        res.json({

            success: true,

            data: {

                accessStatus:
                    current.accessStatus || "--",

                uid:
                    current.uid || "--",

                userName:
                    current.userName || "--",

                date:
                    current.date || "--",

                time:
                    current.time || "--",

                temperature:
                    sensors.temperature ?? "--",

                humidity:
                    sensors.humidity ?? "--"

            }

        });

    } catch (error) {

        console.error(
            "Firebase Current Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan data Firebase.",

            error:
                error.message

        });

    }

});

// ======================================================
// FIREBASE ACCESS LOGS
// ======================================================

app.get("/api/access-logs", async (req, res) => {

    try {

        if (!firebaseReady || !database) {

            return res.status(500).json({

                success: false,

                message:
                    "Firebase belum berjaya initialize."

            });

        }

        const snapshot =
            await database
                .ref("accessLogs")
                .once("value");

        const data =
            snapshot.val() || {};

        const records =
            Object.entries(data)
                .sort(
                    (a, b) =>
                        Number(b[0]) -
                        Number(a[0])
                )
                .slice(0, 20)
                .map(([timestamp, item]) => ({

                    timestamp,

                    uid:
                        item.uid || "--",

                    userName:
                        item.userName || "--",

                    status:
                        item.status || "--",

                    date:
                        item.date || "--",

                    time:
                        item.time || "--"

                }));

        res.json({

            success: true,

            data: records

        });

    } catch (error) {

        console.error(
            "Firebase Access Log Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan access logs.",

            error:
                error.message

        });

    }

});

// ======================================================
// FIREBASE ALERTS
// ======================================================

app.get("/api/alerts", async (req, res) => {

    try {

        if (!firebaseReady || !database) {

            return res.status(500).json({

                success: false,

                message:
                    "Firebase belum berjaya initialize."

            });

        }

        const snapshot =
            await database
                .ref("alerts")
                .once("value");

        const data =
            snapshot.val() || {};

        const records =
            Object.entries(data)
                .sort(
                    (a, b) =>
                        Number(b[0]) -
                        Number(a[0])
                )
                .slice(0, 20)
                .map(([timestamp, item]) => ({

                    timestamp,

                    type:
                        item.type || "--",

                    message:
                        item.message || "--",

                    date:
                        item.date || "--",

                    time:
                        item.time || "--"

                }));

        res.json({

            success: true,

            data: records

        });

    } catch (error) {

        console.error(
            "Firebase Alert Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan alerts.",

            error:
                error.message

        });

    }

});

// ======================================================
// FIREBASE HISTORY
// ======================================================

app.get("/api/history", async (req, res) => {

    try {

        if (!firebaseReady || !database) {

            return res.status(500).json({

                success: false,

                message:
                    "Firebase belum berjaya initialize."

            });

        }

        const snapshot =
            await database
                .ref("history")
                .once("value");

        const data =
            snapshot.val() || {};

        const records =
            Object.entries(data)
                .sort(
                    (a, b) =>
                        Number(b[0]) -
                        Number(a[0])
                )
                .slice(0, 20)
                .map(([timestamp, item]) => ({

                    timestamp,

                    event:
                        item.event || "--",

                    message:
                        item.message || "--",

                    date:
                        item.date || "--",

                    time:
                        item.time || "--"

                }));

        res.json({

            success: true,

            data: records

        });

    } catch (error) {

        console.error(
            "Firebase History Error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan Firebase history.",

            error:
                error.message

        });

    }

});

// ======================================================
// SYSTEM STATUS
// ======================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        blynk:
            !!BLYNK_AUTH_TOKEN,

        firebase:
            firebaseReady,

        database:
            firebaseReady
                ? "Connected"
                : "Disconnected",

        time:
            new Date().toISOString()

    });

});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        "        NETGUARD DASHBOARD"
    );

    console.log(
        "======================================"
    );

    console.log(
        `Website: http://localhost:${PORT}`
    );

    console.log(
        "Blynk: READY"
    );

    console.log(
        `Firebase: ${
            firebaseReady
                ? "READY"
                : "ERROR"
        }`
    );

    console.log(
        "======================================"
    );

    console.log("");

});