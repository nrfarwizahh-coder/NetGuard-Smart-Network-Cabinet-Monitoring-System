// ======================================================
// NETGUARD DASHBOARD
// BLYNK + FIREBASE
// ======================================================

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ======================================================
// PORT
// ======================================================

const PORT = process.env.PORT || 3000;

// ======================================================
// BLYNK
// ======================================================

const BLYNK_AUTH_TOKEN = process.env.BLYNK_AUTH_TOKEN;

async function getBlynk(pin) {
    try {

        const response = await axios.get(
            `https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&${pin}`
        );

        return response.data;

    } catch (error) {

        console.error(
            `Blynk API error ${pin}:`,
            error.response?.data || error.message
        );

        return null;
    }
}

// ======================================================
// FIREBASE
// ======================================================

const FIREBASE_DATABASE_URL =
    "https://netguard-814d7-default-rtdb.asia-southeast1.firebasedatabase.app";

let database = null;
let firebaseReady = false;

try {

    let serviceAccount;

    // Render
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {

        serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT
        );

    }

    // Local computer
    else {

        const localFile = path.join(
            __dirname,
            "firebase-service-account.json"
        );

        if (fs.existsSync(localFile)) {

            serviceAccount =
                require(localFile);

        } else {

            throw new Error(
                "firebase-service-account.json tidak dijumpai."
            );
        }
    }

    const firebaseApp = initializeApp({

        credential:
            cert(serviceAccount),

        databaseURL:
            FIREBASE_DATABASE_URL

    });

    database =
        getDatabase(firebaseApp);

    firebaseReady = true;

    console.log("Firebase: READY");

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error.message
    );

    firebaseReady = false;
}

// ======================================================
// BLYNK DATA
// ======================================================

app.get("/api/data", async (req, res) => {

    try {

        const [
            temperature,
            humidity,
            doorStatus,
            rfidAccess,
            unauthorizedAccess,
            securityAccess,
            switchStatus,
            port0,
            port1
        ] = await Promise.all([

            getBlynk("V0"),
            getBlynk("V1"),
            getBlynk("V2"),
            getBlynk("V3"),
            getBlynk("V4"),
            getBlynk("V5"),
            getBlynk("V6"),
            getBlynk("V7"),
            getBlynk("V8")

        ]);

        res.json({

            success: true,

            data: {

                temperature,
                humidity,
                doorStatus,
                rfidAccess,
                unauthorizedAccess,
                securityAccess,
                switchStatus,
                port0,
                port1

            }

        });

    } catch (error) {

        console.error(
            "Blynk data error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Gagal mendapatkan data Blynk."

        });

    }

});

// ======================================================
// FIREBASE CURRENT
// ======================================================

app.get("/api/firebase", async (req, res) => {

    if (!firebaseReady || !database) {

        return res.json({

            success: false,

            message:
                "Firebase belum berjaya initialize."

        });

    }

    try {

        const snapshot =
            await database
                .ref("current")
                .once("value");

        res.json({

            success: true,

            data:
                snapshot.exists()
                    ? snapshot.val()
                    : {}

        });

    } catch (error) {

        console.error(
            "Firebase current error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});

// ======================================================
// FIREBASE HISTORY
// ======================================================

app.get("/api/history", async (req, res) => {

    if (!firebaseReady || !database) {

        return res.json({

            success: false,

            message:
                "Firebase belum berjaya initialize."

        });

    }

    try {

        const snapshot =
            await database
                .ref("history")
                .once("value");

        if (!snapshot.exists()) {

            return res.json({

                success: true,

                data: []

            });

        }

        const firebaseData =
            snapshot.val();

        const history = [];

        Object.keys(firebaseData).forEach(key => {

            const item =
                firebaseData[key];

            history.push({

                id: key,

                date:
                    item.date || "",

                time:
                    item.time || "",

                timestamp:
                    item.timestamp || null,

                temperature:
                    item.temperature ?? null,

                humidity:
                    item.humidity ?? null,

                doorStatus:
                    item.doorStatus ||
                    item.accessStatus ||
                    item.door ||
                    "",

                rfidAccess:
                    item.rfidAccess ||
                    item.uid ||
                    "",

                currentUser:
                    item.currentUser ||
                    item.userName ||
                    "",

                unauthorizedAccess:
                    item.unauthorizedAccess ?? 0,

                securityAccess:
                    item.securityAccess ||
                    item.security ||
                    "",

                event:
                    item.event || "",

                message:
                    item.message || ""

            });

        });

        history.sort((a, b) => {

            return (
                Number(b.timestamp || 0) -
                Number(a.timestamp || 0)
            );

        });

        res.json({

            success: true,

            data: history

        });

    } catch (error) {

        console.error(
            "Firebase history error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});

// ======================================================
// ACCESS LOGS
// ======================================================

app.get("/api/access-logs", async (req, res) => {

    if (!firebaseReady || !database) {

        return res.json({

            success: false,

            message:
                "Firebase belum berjaya initialize."

        });

    }

    try {

        const snapshot =
            await database
                .ref("access_logs")
                .once("value");

        if (!snapshot.exists()) {

            return res.json({

                success: true,

                data: []

            });

        }

        const data =
            snapshot.val();

        const logs =
            Object.keys(data).map(key => ({

                id: key,

                ...data[key]

            }));

        logs.sort((a, b) => {

            return (
                Number(b.timestamp || 0) -
                Number(a.timestamp || 0)
            );

        });

        res.json({

            success: true,

            data: logs

        });

    } catch (error) {

        console.error(
            "Access logs error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});

// ======================================================
// ALERTS
// ======================================================

app.get("/api/alerts", async (req, res) => {

    if (!firebaseReady || !database) {

        return res.json({

            success: false,

            message:
                "Firebase belum berjaya initialize."

        });

    }

    try {

        const snapshot =
            await database
                .ref("alerts")
                .once("value");

        if (!snapshot.exists()) {

            return res.json({

                success: true,

                data: []

            });

        }

        const data =
            snapshot.val();

        const alerts =
            Object.keys(data).map(key => ({

                id: key,

                ...data[key]

            }));

        alerts.sort((a, b) => {

            return (
                Number(b.timestamp || 0) -
                Number(a.timestamp || 0)
            );

        });

        res.json({

            success: true,

            data: alerts

        });

    } catch (error) {

        console.error(
            "Alerts error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});

// ======================================================
// STATUS
// ======================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        blynk:
            BLYNK_AUTH_TOKEN
                ? "READY"
                : "ERROR",

        firebase:
            firebaseReady
                ? "READY"
                : "ERROR"

    });

});

// ======================================================
// FRONTEND
// ======================================================

app.use((req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log("======================================");

    console.log(
        "      NETGUARD DASHBOARD"
    );

    console.log("======================================");

    console.log(
        `Website: http://localhost:${PORT}`
    );

    console.log(
        `Blynk: ${
            BLYNK_AUTH_TOKEN
                ? "READY"
                : "ERROR"
        }`
    );

    console.log(
        `Firebase: ${
            firebaseReady
                ? "READY"
                : "ERROR"
        }`
    );

    console.log("======================================");

});