const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const WASENDER_TOKEN = process.env.WASENDER_TOKEN;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER;

if (!WASENDER_TOKEN || !MY_WHATSAPP_NUMBER) {
    console.error("Missing environment variables.");
    process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Website
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API status
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        service: "HZR 2010",
        status: "online"
    });
});

// Send browser information
app.post("/api/send-device-info", async (req, res) => {

    console.log("=================================");
    console.log("DEVICE INFO REQUEST RECEIVED");
    console.log("=================================");

    try {

        const info = req.body || {};

        const message =
`🔵 HZR 2010

Device Information
-------------------------
User Agent: ${info.userAgent || "Unknown"}
Language: ${info.language || "Unknown"}
Platform: ${info.platform || "Unknown"}
Online: ${info.online ?? "Unknown"}

Screen: ${info.screen || "Unknown"}
Viewport: ${info.viewport || "Unknown"}
Pixel Ratio: ${info.pixelRatio || "Unknown"}

Timezone: ${info.timezone || "Unknown"}
CPU Threads: ${info.hardwareConcurrency || "Unknown"}
Device Memory: ${info.deviceMemory || "Unknown"} GB
Touch Points: ${info.maxTouchPoints || "Unknown"}

Time: ${info.time || "Unknown"}
-------------------------
HZR 2010`;

        console.log("Sending message to Wasender...");
        console.log("Recipient:", MY_WHATSAPP_NUMBER);

        const response = await fetch(
            "https://api.wasender.dev/messages/text",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${WASENDER_TOKEN}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    to: MY_WHATSAPP_NUMBER,
                    body: message
                })
            }
        );

        const resultText = await response.text();

        console.log("Wasender HTTP status:", response.status);
        console.log("Wasender response:", resultText);

        if (!response.ok) {

            return res.status(502).json({
                success: false,
                error: "WhatsApp API error"
            });
        }

        let result = {};

        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.log("Wasender response was not JSON.");
        }

        res.json({
            success: true,
            message: "Sent successfully",
            wasender: result
        });

    } catch (error) {

        console.error("Server error:", error);

        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`HZR 2010 running on port ${PORT}`);
});
