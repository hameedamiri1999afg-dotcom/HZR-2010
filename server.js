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
// BAD WORDS
// ==========================================================

// فعلاً چند نمونه آزمایشی.
// بعداً فهرست موردنظر را کامل‌تر می‌کنیم.

const BAD_WORDS = [
    "fuck",
    "fucking",
    "shit",
    "bitch",
    "asshole"
];

// ==========================================================
// CHECK MESSAGE
// ==========================================================

function containsBadWord(text) {
    if (!text) return false;

    const normalizedText = text
        .toLowerCase()
        .replace(/[.,!?;:()[\]{}"']/g, " ");

    return BAD_WORDS.some(word => {
        const pattern = new RegExp(`\\b${word}\\b`, "i");
        return pattern.test(normalizedText);
    });
}

// ==========================================================
// WHATSAPP WEBHOOK
// ==========================================================

app.post("/api/whatsapp/webhook", (req, res) => {

    console.log("\n=================================");
    console.log("HZR 2010 - WHATSAPP WEBHOOK");
    console.log("=================================");

    try {

        const data = req.body || {};
        const messages = Array.isArray(data.messages)
            ? data.messages
            : [];

        for (const message of messages) {

            // فقط پیام‌های متنی
            if (message.type !== "text") {
                continue;
            }

            // پیام‌های خودمان را بررسی نکن
            if (message.from_me === true) {
                continue;
            }

            // فقط پیام‌های گروه
            if (!message.chat_id?.endsWith("@g.us")) {
                continue;
            }

            const text = message.text?.body || "";

            console.log("Group message:");
            console.log("Group:", message.chat_id);
            console.log("From:", message.phone);
            console.log("Text:", text);

            if (containsBadWord(text)) {

                console.log("!!! BAD WORD DETECTED !!!");
                console.log("Message ID:", message.id);
                console.log("Sender:", message.phone);
                console.log("Text:", text);

            } else {

                console.log("Message is clean.");

            }
        }

        return res.status(200).json({
            success: true,
            received: true
        });

    } catch (error) {

        console.error("Webhook processing error:", error);

        return res.status(500).json({
            success: false,
            error: "Webhook processing failed"
        });
    }
});

// ==========================================================
// 404
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
