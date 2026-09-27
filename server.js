const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const WASENDER_TOKEN = process.env.WASENDER_TOKEN;

// ==========================================================
// ENVIRONMENT
// ==========================================================

if (!WASENDER_TOKEN) {
    console.error("ERROR: Missing WASENDER_TOKEN.");
    console.error("Set WASENDER_TOKEN in Render Environment Variables.");
    process.exit(1);
}

// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// ==========================================================
// HOME
// ==========================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
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
// WHATSAPP WEBHOOK
// ==========================================================

app.post("/api/whatsapp/webhook", (req, res) => {
    console.log("\n=================================");
    console.log("HZR 2010 - WHATSAPP WEBHOOK");
    console.log("=================================");

    try {
        const webhookData = req.body || {};

        console.log("Webhook received:");
        console.log(JSON.stringify(webhookData, null, 2));

        res.status(200).json({
            success: true,
            received: true
        });

    } catch (error) {
        console.error("Webhook processing error:", error);

        res.status(500).json({
            success: false,
            error: "Webhook processing failed"
        });
    }
});

// ==========================================================
// 404 HANDLER
// ==========================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found"
    });
});

// ==========================================================
// START SERVER
// ==========================================================

app.listen(PORT, () => {
    console.log("=================================");
    console.log("HZR 2010");
    console.log(`Server running on port ${PORT}`);
    console.log("WhatsApp webhook: /api/whatsapp/webhook");
    console.log("=================================");
});
