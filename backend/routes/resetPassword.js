import express from "express";
import admin from "../firebaseAdmin.js";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/send-reset-email", async (req, res) => {
  try {
    console.log("Forgot password API hit");

    const { email } = req.body;

    const resetLink = await admin
      .auth()
      .generatePasswordResetLink(email);

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
    console.log("RESET PASSWORD ERROR:");
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
