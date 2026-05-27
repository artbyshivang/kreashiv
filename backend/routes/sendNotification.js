import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/send-notification", async (req, res) => {
  try {
    console.log("Send notification API hit");

    const { pushToken, title, body, data } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        error: "Missing pushToken parameter",
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing title or body parameter",
      });
    }

    // Send request to Expo Push Notification API
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        title: title,
        body: body,
        data: data || {},
      }),
    });

    const result = await response.json();

    console.log("Expo API Response:", result);

    if (response.ok) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      res.status(response.status).json({
        success: false,
        error: result,
      });
    }
  } catch (error) {
    console.log("SEND NOTIFICATION ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
