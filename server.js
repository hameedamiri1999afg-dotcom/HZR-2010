const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const WASENDER_TOKEN = process.env.WASENDER_TOKEN;

// =====================================
// ENVIRONMENT
// =====================================

if (!WASENDER_TOKEN) {
    console.error("ERROR: Missing WASENDER_TOKEN.");
    console.error("Set WASENDER_TOKEN in Render Environment Variables.");
    process.exit(1);
}

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// =====================================
// STATUS
// =====================================

app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        service: "HZR 2010",
        status: "online"
    });
});

// =====================================
// BAD WORDS
// =====================================

const BAD_WORDS = [
    // فارسی
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

    // English
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

// =====================================
// NORMALIZE TEXT
// =====================================

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

        // Replace punctuation with spaces
        .replace(/[.,!?;:()[\]{}"'،؛؟]/g, " ")

        // Normalize spaces
        .replace(/\s+/g, " ")
        .trim();
}

// =====================================
// BAD WORD DETECTOR
// =====================================

function containsBadWord(text) {
    const normalized = normalizeText(text);

    if (!normalized) {
        return false;
    }

    const words = normalized.split(" ");

    return BAD_WORDS.some(word => {
        const badWord = normalizeText(word);

        // English
        if (/^[a-z0-9]+$/i.test(badWord)) {
            const pattern = new RegExp(`\\b${badWord}\\b`, "i");
            return pattern.test(normalized);
        }

        // Persian phrase
        if (badWord.includes(" ")) {
            return normalized.includes(badWord);
        }

        // Persian single word
        return words.includes(badWord);
    });
}

// =====================================
// DELETE WHATSAPP MESSAGE
// =====================================

async function deleteWhatsAppMessage(messageId, chatId) {

    if (!messageId || !chatId) {
        console.error(
            "DELETE FAILED: Missing message ID or chat ID."
        );
        return false;
    }

    const url =
        `https://api.wasender.dev/messages/${encodeURIComponent(messageId)}`;

    console.log("---------------------------------");
    console.log("DELETE REQUEST");
    console.log("Message ID:", messageId);
    console.log("Chat ID:", chatId);
    console.log("URL:", url);

    try {

        const response = await fetch(url, {
            method: "DELETE",

            headers: {
                "Authorization": `Bearer ${WASENDER_TOKEN}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                to: chatId
            })
        });

        const responseText = await response.text();

        console.log("DELETE STATUS:", response.status);
        console.log("DELETE RESPONSE:", responseText);

        if (response.ok) {

            console.log(
                "MESSAGE DELETED SUCCESSFULLY"
            );

            console.log("---------------------------------");

            return true;
        }

        console.error(
            "MESSAGE DELETE FAILED"
        );

        console.log("---------------------------------");

        return false;

    } catch (error) {

        console.error(
            "DELETE REQUEST ERROR:",
            error
        );

        console.log("---------------------------------");

        return false;
    }
}

// =====================================
// WHATSAPP WEBHOOK
// =====================================

app.post("/api/whatsapp/webhook", async (req, res) => {

    console.log("\n=================================");
    console.log("HZR 2010 - WHATSAPP WEBHOOK");
    console.log("=================================");

    try {

        const data = req.body || {};

        const messages = Array.isArray(data.messages)
            ? data.messages
            : [];

        if (messages.length === 0) {

            console.log(
                "No messages in webhook."
            );

            return res.status(200).json({
                success: true,
                received: true
            });
        }

        for (const message of messages) {

            // Only text messages
            if (message.type !== "text") {
                continue;
            }

            // Ignore our own messages
            if (message.from_me === true) {
                continue;
            }

            // Only WhatsApp groups
            if (!message.chat_id?.endsWith("@g.us")) {
                continue;
            }

            const text = message.text?.body || "";

            console.log("\nGROUP MESSAGE");
            console.log("Group:", message.chat_id);
            console.log("From:", message.phone);
            console.log("Text:", text);
            console.log("Message ID:", message.id);

            // =================================
            // CHECK BAD WORD
            // =================================

            if (containsBadWord(text)) {

                console.log("");
                console.log(
                    "!!! BAD WORD DETECTED !!!"
                );

                console.log(
                    "Sender:",
                    message.phone
                );

                console.log(
                    "Text:",
                    text
                );

                console.log(
                    "Message ID:",
                    message.id
                );

                // =================================
                // DELETE MESSAGE
                // =================================

                await deleteWhatsAppMessage(
                    message.id,
                    message.chat_id
                );

            } else {

                console.log(
                    "Message is clean."
                );
            }
        }

        return res.status(200).json({
            success: true,
            received: true
        });

    } catch (error) {

        console.error(
            "WEBHOOK PROCESSING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Webhook processing failed"
        });
    }
});

// =====================================
// 404
// =====================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: "Not Found"
    });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {

    console.log("=================================");
    console.log("HZR 2010");
    console.log(
        `Server running on port ${PORT}`
    );
    console.log(
        "WhatsApp webhook: /api/whatsapp/webhook"
    );
    console.log("=================================");
});
