import express from "express";
import admin from "../firebaseAdmin.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory rate limiting: 2-minute cooldown per email
const verifyCooldowns = new Map();
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

router.post("/send-verification-email", async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const clientIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    if (!rawEmail || typeof rawEmail !== "string" || !rawEmail.includes("@")) {
      console.log(`[VERIFY EMAIL REJECTED] Missing or invalid email. IP: ${clientIp}`);
      return res.status(400).json({
        success: false,
        error: "Valid email address is required",
      });
    }

    const email = rawEmail.trim().toLowerCase();
    const now = Date.now();
    const lastSent = verifyCooldowns.get(email);

    if (lastSent && now - lastSent < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      console.log(`[VERIFY EMAIL BLOCKED] Rate limit hit for ${email}. Wait: ${waitSeconds}s. IP: ${clientIp}`);
      return res.status(429).json({
        success: false,
        error: `A verification email was already sent recently. Please wait ${waitSeconds} seconds before requesting again.`,
      });
    }

    console.log(`[VERIFY EMAIL SENDING] Email: ${email}, IP: ${clientIp}`);
    verifyCooldowns.set(email, now);

    // Generate Firebase Email Verification link with actionCodeSettings for Custom Domain
    const actionCodeSettings = {
      url: process.env.AUTH_ACTION_URL || "https://kreashiv.cloud/auth-action.html",
      handleCodeInApp: false,
    };

    const rawLink = await admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings);

    // Ensure the link explicitly targets custom domain landing page
    const customDomain = process.env.AUTH_ACTION_URL || "https://kreashiv.cloud/auth-action.html";
    const verificationLink = rawLink.replace(/https:\/\/[^/]+\/__\/auth\/action/, customDomain);

    // Send using Resend
    const response = await resend.emails.send({
      from: "Kreashiv <noreply@kreashiv.cloud>",
      to: email,
      subject: "Verify your email for Kreashiv",
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f7faf7; padding: 40px 20px; border-radius: 12px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 72, 57, 0.05); text-align: center;">
            <div style="background-color: #004839; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 24px; display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 32px;">✉️</span>
            </div>
            
            <h1 style="color: #004839; font-size: 24px; margin-bottom: 16px; font-weight: 700;">Welcome to Kreashiv!</h1>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
              Thanks for signing up. Please verify your email address to get access to all features.
              Click the button below to confirm your account.
            </p>
            
            <a
              href="${verificationLink}"
              style="background-color: #004839; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; letter-spacing: 0.5px;"
            >
              Verify Email Address
            </a>
            
            <hr style="border: none; border-top: 1px solid #eef2f0; margin: 40px 0 20px;" />
            <p style="color: #999999; font-size: 13px;">
              Having trouble? You can also copy and paste this link into your browser:<br/>
              <span style="color: #004839; word-break: break-all; margin-top: 8px; display: inline-block;">${verificationLink}</span>
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
    console.log("VERIFY EMAIL ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
