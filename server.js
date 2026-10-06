const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const admin = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const BLYNK_AUTH_TOKEN = process.env.BLYNK_AUTH_TOKEN;


// ==================================================
// FIREBASE CONFIGURATION
// ==================================================

const FIREBASE_DATABASE_URL =
    "https://netguard-814d7-default-rtdb.asia-southeast1.firebasedatabase.app";

let firebaseReady = false;
let database = null;


// ==================================================
// INITIALIZE FIREBASE
// ==================================================

try {

    const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
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


// ==================================================
// CHECK BLYNK TOKEN
// ==================================================

if (!BLYNK_AUTH_TOKEN) {

    console.error(
        "ERROR: BLYNK_AUTH_TOKEN tidak dijumpai dalam .env"
    );

    process.exit(1);

}


// ==================================================
// SERVE WEBSITE
// ==================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==================================================
// BLYNK FUNCTION
// ==================================================

async function getBlynkValue(pin) {

    const url =
        `https://blynk.cloud/external/api/get?token=${encodeURIComponent(BLYNK_AUTH_TOKEN)}&${pin}`;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Blynk API error ${pin}: ${response.status}`
        );

    }

    return await response.text();

}


// ==================================================
// BLYNK DATA
// ==================================================

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
    g0,
    g01
] = await Promise.all([
    getBlynkValue("V0"),
    getBlynkValue("V1"),
    getBlynkValue("V2"),
    getBlynkValue("V3"),
    getBlynkValue("V4"),
    getBlynkValue("V5"),
    getBlynkValue("V6"),
    getBlynkValue("V7"),
    getBlynkValue("V8")
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
    g0,
    g01

},

            updatedAt:
                new Date().toISOString()

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


// ==================================================
// FIREBASE TEST
// ==================================================

app.get("/api/firebase-test", async (req, res) => {

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
                .ref("current")
                .once("value");


        const data =
            snapshot.val();


        res.json({

            success: true,

            message:
                "Firebase connection berjaya",

            data: data

        });


    } catch (error) {

        console.error(
            "Firebase Test Error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Firebase error",

            error:
                error.message

        });

    }

});


// ==================================================
// FIREBASE CURRENT DATA
// ==================================================

app.get("/api/firebase", async (req, res) => {

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
                .ref("current")
                .once("value");


        const data =
            snapshot.val();


        if (data === null) {

            return res.json({

                success: true,

                data: null,

                message:
                    "Tiada data di Firebase/current."

            });

        }


        res.json({

            success: true,

            data: data

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


// ==================================================
// FIREBASE HISTORY
// ==================================================

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
            snapshot.val();


        res.json({

            success: true,

            data: data || {}

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


// ==================================================
// SERVER STATUS
// ==================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        blynk: !!BLYNK_AUTH_TOKEN,

        firebase: firebaseReady,

        database: firebaseReady
            ? "Connected"
            : "Disconnected",

        time:
            new Date().toISOString()

    });

});


// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        "      NETGUARD DASHBOARD"
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