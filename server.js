const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const admin = require("firebase-admin");
const {
    getDatabase,
    ref,
    get
} = require("firebase-admin/database");

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

    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {

        throw new Error(
            "FIREBASE_SERVICE_ACCOUNT tidak dijumpai dalam environment variables."
        );

    }

    const serviceAccount =
        JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT
        );

    admin.initializeApp({

        credential:
            admin.credential.cert(
                serviceAccount
            ),

        databaseURL:
            FIREBASE_DATABASE_URL

    });

    database =
        getDatabase();

    firebaseReady =
        true;

    console.log(
        "Firebase: READY"
    );

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
        "ERROR: BLYNK_AUTH_TOKEN tidak dijumpai dalam environment variables."
    );

    process.exit(1);

}


// ==================================================
// SERVE WEBSITE
// ==================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ==================================================
// BLYNK FUNCTION
// ==================================================

async function getBlynkValue(pin) {

    const url =
        `https://blynk.cloud/external/api/get?token=${encodeURIComponent(
            BLYNK_AUTH_TOKEN
        )}&${pin}`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Blynk API error ${pin}: ${response.status}`
        );

    }

    return await response.text();

}


// ==================================================
// BLYNK DATA
//
// V0 = Temperature
// V1 = Humidity
// V2 = Door Status
// V3 = RFID Access
// V4 = Unauthorized Access
// V5 = Security Access
// V6 = Switch Status
// V7 = G0/0
// V8 = G0/1
// ==================================================

app.get(
    "/api/data",
    async (req, res) => {

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

    }
);


// ==================================================
// FIREBASE TEST
// ==================================================

app.get(
    "/api/firebase-test",
    async (req, res) => {

        try {

            if (
                !firebaseReady ||
                !database
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Firebase belum berjaya initialize."

                });

            }

            const snapshot =
                await get(
                    ref(
                        database,
                        "current"
                    )
                );

            const data =
                snapshot.exists()
                    ? snapshot.val()
                    : null;

            res.json({

                success: true,

                message:
                    "Firebase connection berjaya",

                data:
                    data

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

    }
);


// ==================================================
// FIREBASE CURRENT DATA
//
// Reads:
//
// /current
//
// This is the current NetGuard data.
// ==================================================

app.get(
    "/api/firebase",
    async (req, res) => {

        try {

            if (
                !firebaseReady ||
                !database
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Firebase belum berjaya initialize."

                });

            }

            const snapshot =
                await get(
                    ref(
                        database,
                        "current"
                    )
                );

            const data =
                snapshot.exists()
                    ? snapshot.val()
                    : null;

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

    }
);


// ==================================================
// FIREBASE HISTORY
//
// Reads:
//
// /history
// ==================================================

app.get(
    "/api/history",
    async (req, res) => {

        try {

            if (
                !firebaseReady ||
                !database
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Firebase belum berjaya initialize."

                });

            }


            const historyRef =
                ref(
                    database,
                    "history"
                );


            const snapshot =
                await get(
                    historyRef
                );


            const data =
                snapshot.exists()
                    ? snapshot.val()
                    : {};


            const records =
                Object.entries(data)
                    .map(
                        ([key, value]) => {

                            return {

                                key,

                                temperature:
                                    value?.temperature ??
                                    "--",

                                humidity:
                                    value?.humidity ??
                                    "--",

                                rfidAccess:
                                    value?.rfidAccess ??
                                    "--",

                                unauthorized:
                                    value?.unauthorizedAccess ??
                                    value?.unauthorized ??
                                    "--",

                                currentUser:
                                    value?.currentUser ??
                                    "--",

                                securityAccess:
                                    value?.securityAccess ??
                                    "--",

                                doorStatus:
                                    value?.doorStatus ??
                                    "--",

                                timestamp:
                                    value?.timestamp ??
                                    key,

                                date:
                                    value?.date ??
                                    "--",

                                time:
                                    value?.time ??
                                    "--",

                                event:
                                    value?.event ??
                                    "--",

                                message:
                                    value?.message ??
                                    "--"

                            };

                        }
                    )
                    .sort(
                        (a, b) => {

                            const timestampA =
                                Number(
                                    a.timestamp
                                );

                            const timestampB =
                                Number(
                                    b.timestamp
                                );


                            if (
                                !isNaN(timestampA) &&
                                !isNaN(timestampB)
                            ) {

                                return (
                                    timestampB -
                                    timestampA
                                );

                            }


                            return 0;

                        }
                    )
                    .slice(
                        0,
                        50
                    );


            res.json({

                success: true,

                data:
                    records

            });


        } catch (error) {

            console.error(
                "Firebase History Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Gagal mendapatkan Firebase history.",

                error:
                    error.message

            });

        }

    }
);


// ==================================================
// FIREBASE ACCESS LOGS
// ==================================================

app.get(
    "/api/access-logs",
    async (req, res) => {

        try {

            if (
                !firebaseReady ||
                !database
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Firebase belum berjaya initialize."

                });

            }

            const snapshot =
                await get(
                    ref(
                        database,
                        "accessLogs"
                    )
                );

            const data =
                snapshot.exists()
                    ? snapshot.val()
                    : {};

            const records =
                Object.entries(data)
                    .map(
                        ([key, value]) => ({

                            key,

                            date:
                                value?.date ||
                                "--",

                            time:
                                value?.time ||
                                "--",

                            uid:
                                value?.uid ||
                                "--",

                            userName:
                                value?.userName ||
                                "--",

                            status:
                                value?.status ||
                                "--"

                        })
                    )
                    .sort(
                        (a, b) => {

                            const aTime =
                                new Date(
                                    `${a.date} ${a.time}`
                                ).getTime();

                            const bTime =
                                new Date(
                                    `${b.date} ${b.time}`
                                ).getTime();

                            return bTime - aTime;

                        }
                    )
                    .slice(
                        0,
                        50
                    );

            res.json({

                success: true,

                data:
                    records

            });

        } catch (error) {

            console.error(
                "Access Logs Error:",
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

    }
);


// ==================================================
// FIREBASE ALERTS
// ==================================================

app.get(
    "/api/alerts",
    async (req, res) => {

        try {

            if (
                !firebaseReady ||
                !database
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Firebase belum berjaya initialize."

                });

            }

            const snapshot =
                await get(
                    ref(
                        database,
                        "alerts"
                    )
                );

            const data =
                snapshot.exists()
                    ? snapshot.val()
                    : {};

            const records =
                Object.entries(data)
                    .map(
                        ([key, value]) => ({

                            key,

                            date:
                                value?.date ||
                                "--",

                            time:
                                value?.time ||
                                "--",

                            type:
                                value?.type ||
                                value?.event ||
                                "--",

                            message:
                                value?.message ||
                                "--"

                        })
                    )
                    .slice(
                        -50
                    )
                    .reverse();

            res.json({

                success: true,

                data:
                    records

            });

        } catch (error) {

            console.error(
                "Alerts Error:",
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

    }
);


// ==================================================
// SERVER STATUS
// ==================================================

app.get(
    "/api/status",
    (req, res) => {

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

    }
);


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

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

    }
);