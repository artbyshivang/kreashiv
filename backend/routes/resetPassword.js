import express from "express";
import admin from "../firebaseAdmin.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory rate limiting:
// 1. Email cooldown: 15 minutes per email
const resetCooldowns = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

// 2. IP rate limiting: max 3 reset requests per IP per 15 minutes
const ipRequestHistory = new Map();
const MAX_REQUESTS_PER_IP = 3;
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Suspicious bot/tool user agents
const BOT_USER_AGENTS = [
  /curl/i,
  /python/i,
  /postman/i,
  /wget/i,
  /http\.rb/i,
  /scrapy/i,
  /go-http-client/i,
  /java\//i,
];

router.post("/send-reset-email", async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "";

    // 1. Reject known bot User-Agents
    if (BOT_USER_AGENTS.some((pattern) => pattern.test(userAgent))) {
      console.log(`[RESET PWD BLOCKED] Bot detected (${userAgent}). IP: ${clientIp}`);
      return res.status(403).json({
        success: false,
        error: "Access denied.",
      });
    }

    // 2. Validate email format
    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      console.log(`[RESET PWD REJECTED] Missing or invalid email. IP: ${clientIp}`);
      return res.status(400).json({
        success: false,
        error: "Valid email address is required",
      });
    }

    const email = rawEmail.trim().toLowerCase();
    const now = Date.now();

    // 3. IP Rate Limiting
    const ipTimestamps = ipRequestHistory.get(clientIp) || [];
    const validIpTimestamps = ipTimestamps.filter((ts) => now - ts < IP_WINDOW_MS);
    if (validIpTimestamps.length >= MAX_REQUESTS_PER_IP) {
      console.log(`[RESET PWD BLOCKED] IP rate limit exceeded for ${clientIp}`);
      return res.status(429).json({
        success: false,
        error: "Too many reset requests from this network. Please wait a few minutes before trying again.",
      });
    }

    // 4. Per-Email Cooldown (15 minutes)
    const lastSent = resetCooldowns.get(email);
    if (lastSent && now - lastSent < COOLDOWN_MS) {
      const waitMinutes = Math.ceil((COOLDOWN_MS - (now - lastSent)) / (60 * 1000));
      console.log(`[RESET PWD BLOCKED] Email cooldown hit for ${email}. Wait: ${waitMinutes}m. IP: ${clientIp}`);
      return res.status(429).json({
        success: false,
        error: `A password reset link was already sent recently. Please wait ${waitMinutes} minute(s) before requesting again.`,
      });
    }

    // 5. Verify user actually exists in Firebase Authentication
    try {
      await admin.auth().getUserByEmail(email);
    } catch (authErr) {
      if (authErr.code === "auth/user-not-found") {
        console.log(`[RESET PWD REJECTED] User not found: ${email}. IP: ${clientIp}`);
        return res.status(404).json({
          success: false,
          error: "No account found with this email address.",
        });
      }
      throw authErr;
    }

    console.log(`[RESET PWD SENDING] Email: ${email}, IP: ${clientIp}, UA: ${userAgent}`);

    // Update IP history and email cooldown
    validIpTimestamps.push(now);
    ipRequestHistory.set(clientIp, validIpTimestamps);
    resetCooldowns.set(email, now);

    const actionCodeSettings = {
      url: process.env.AUTH_ACTION_URL || "https://kreashiv.cloud/auth-action.html",
      handleCodeInApp: false,
    };

    const rawLink = await admin
      .auth()
      .generatePasswordResetLink(email, actionCodeSettings);

    const customDomain = process.env.AUTH_ACTION_URL || "https://kreashiv.cloud/auth-action.html";
    const resetLink = rawLink.replace(/https:\/\/[^/]+\/__\/auth\/action/, customDomain);

    const response = await resend.emails.send({
      from: "Kreashiv <noreply@kreashiv.cloud>",
      to: email,
      subject: "Reset your Kreashiv password",

      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7faf7; padding: 40px 20px; border-radius: 12px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 72, 57, 0.05); text-align: center;">
            <div style="background-color: #004839; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 24px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">🔐</span>
            </div>
            
            <h1 style="color: #004839; font-size: 24px; margin-bottom: 16px; font-weight: 700;">Reset Your Password</h1>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              We received a request to reset the password for your Kreashiv account. 
              Click the button below to set a new password. If you didn't request this, you can safely ignore this email.
            </p>
            
            <a
              href="${resetLink}"
              style="background-color: #004839; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;"
            >
              Reset Password
            </a>
            
            <hr style="border: none; border-top: 1px solid #eef2f0; margin: 40px 0 20px;" />
            <p style="color: #999999; font-size: 13px;">
              Having trouble? You can also copy and paste this link into your browser:<br/>
              <span style="color: #004839; word-break: break-all; margin-top: 8px; display: inline-block;">${resetLink}</span>
            </p>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      response,
    });

  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Unable to send reset email",
    });
  }
});

export default router;
