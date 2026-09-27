const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const WASENDER_TOKEN = process.env.WASENDER_TOKEN;

// ==========================================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================================

if (!WASENDER_TOKEN) {
console.error("=================================");
console.error("ERROR: Missing WASENDER_TOKEN");
console.error("Please set WASENDER_TOKEN in Render Environment Variables.");
console.error("=================================");

process.exit(1);

}

// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(
express.json({
limit: "100kb"
})
);

// ==========================================================
// HOME PAGE
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
// WHATSAPP WEBHOOK
// ==========================================================

app.post("/api/whatsapp/webhook", async (req, res) => {

console.log("");
console.log("=================================");
console.log("HZR 2010 - WHATSAPP WEBHOOK");
console.log("=================================");

try {

    const data = req.body || {};

    console.log("Webhook received:");
    console.log(JSON.stringify(data, null, 2));

    // فعلاً هیچ پیامی حذف نمی‌شود.
    // در مرحله بعد، پیام‌های گروه را از اینجا
    // تشخیص می‌دهیم.

    return res.status(200).json({
        success: true,
        received: true
    });

} catch (error) {

    console.error("Webhook error:");
    console.error(error);

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
console.log("WhatsApp webhook:");
console.log("/api/whatsapp/webhook");
console.log("=================================");

});
