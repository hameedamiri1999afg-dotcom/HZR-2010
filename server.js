const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const WASENDER_TOKEN = process.env.WASENDER_TOKEN;

// ===============================
// CHECK ENVIRONMENT
// ===============================

if (!WASENDER_TOKEN) {
    console.error("ERROR: Missing WASENDER_TOKEN.");
    console.error("Set WASENDER_TOKEN in Render Environment Variables.");
    process.exit(1);
}

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ===============================
// STATUS
// ===============================

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        service: "HZR 2010",
        status: "online"
    });
});

// ===============================
// BAD WORDS
// ===============================

const BAD_WORDS = [
    // ===========================
    // فارسی
    // ===========================

    "کون",
    "کونی",
    "کوس",
    "لوده",
    "احمق",
    "احمقانه",
    "بی شعور",
    "بی‌شعور",
    "خر",
    "الاغ",
    "دیوانه",

    // ===========================
    // English
    // ===========================

    "fuck",
    "fucking",
    "fucked",
    "shit",
    "bitch",
    "asshole",
    "idiot",
    "stupid",
    "dumb",
    "moron",
    "jerk",
    "loser"
];

// ===============================
// TEXT NORMALIZATION
// ===============================

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFKC")

        // Arabic -> Persian
        .replace(/ي/g, "ی")
        .replace(/ى/g, "ی")
        .replace(/ك/g, "ک")

        // Remove Arabic diacritics
        .replace(/[\u064B-\u065F\u0670]/g, "")

        // Remove zero-width characters
        .replace(/[\u200B-\u200D\uFEFF]/g, "")

        // Convert punctuation to spaces
        .replace(/[.,!?;:()[\]{}"'،؛؟]/g, " ")

        // Normalize spaces
        .replace(/\s+/g, " ")
        .trim();
}

// ===============================
// BAD WORD DETECTOR
// ===============================

function containsBadWord(text) {
    const normalized = normalizeText(text);

    if (!normalized) {
        return false;
    }

    const words = normalized.split(" ");

    return BAD_WORDS.some(word => {
        const badWord = normalizeText(word);

        // English words
        if (/^[a-z0-9]+$/i.test(badWord)) {
            const pattern = new RegExp(`\\b${badWord}\\b`, "i");
            return pattern.test(normalized);
        }

        // Persian words / phrases
        if (badWord.includes(" ")) {
            return normalized.includes(badWord);
        }

        return words.includes(badWord);
    });
}

// ===============================
// DELETE WHATSAPP MESSAGE
// ===============================

async function deleteWhatsAppMessage(messageId) {
    if (!messageId) {
        console.error("Cannot delete message: missing message ID.");
        return false;
    }

    try {
        const response = await fetch(
            `https://api.wasender.dev/messages/${encodeURIComponent(messageId)}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${WASENDER_TOKEN}`
                }
            }
        );

        const resultText = await response.text();

        if (!response.ok) {
            console.error(
                "Wasender delete failed:",
                response.status,
                resultText
            );

            return false;
        }

        console.log("MESSAGE DELETED SUCCESSFULLY");
        console.log("Message ID:", messageId);

        return true;

    } catch (error) {
        console.error("Delete request error:", error);
        return false;
    }
}

// ===============================
// WHATSAPP WEBHOOK
// ===============================

app.post("/api/whatsapp/webhook", async (req, res) => {

    console.log("\n=================================");
    console.log("HZR 2010 - WHATSAPP WEBHOOK");
    console.log("=================================");

    try {
        const data = req.body || {};

        // Only process message events
        const messages = Array.isArray(data.messages)
            ? data.messages
            : [];

        for (const message of messages) {

            // Only text messages
            if (message.type !== "text") {
                continue;
            }

            // Ignore messages sent by our own WhatsApp number
            if (message.from_me === true) {
                continue;
            }

            // Only WhatsApp groups
            if (!message.chat_id?.endsWith("@g.us")) {
                continue;
            }

            const text = message.text?.body || "";

            console.log("\nGroup message:");
            console.log("Group:", message.chat_id);
            console.log("From:", message.phone);
            console.log("Text:", text);
            console.log("Message ID:", message.id);

            // ===========================
            // CHECK BAD WORD
            // ===========================

            if (containsBadWord(text)) {

                console.log("!!! BAD WORD DETECTED !!!");

                // Delete message
                await deleteWhatsAppMessage(message.id);

            } else {

                console.log("Message is clean.");
            }
        }

        return res.status(200).json({
            success: true,
            received: true
        });

    } catch (error) {

        console.error(
            "Webhook processing error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Webhook processing failed"
        });
    }
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Not Found"
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("HZR 2010");
    console.log(`Server running on port ${PORT}`);
    console.log("WhatsApp webhook:");
    console.log("/api/whatsapp/webhook");
    console.log("=================================");
});
