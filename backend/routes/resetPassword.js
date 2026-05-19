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
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Reset Password</h2>
          <p>Click below to reset your password.</p>

          <a
            href="${resetLink}"
            style="
              background:#7c3aed;
              color:white;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              display:inline-block;
              margin-top:10px;
            "
          >
            Reset Password
          </a>
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
