const express = require("express");

const router = express.Router();

const admin = require("../firebaseAdmin");

const { Resend } = require("resend");

const resend = new Resend(
  process.env.RESEND_API_KEY
);

router.post(
  "/send-reset-email",
  async (req, res) => {

console.log("Forgot password API hit");
console.log("Email:", req.body.email);




    try {

      const { email } = req.body;

      const resetLink =
        await admin
          .auth()
          .generatePasswordResetLink(
            email
          );

      await resend.emails.send({

        from:
          "Kreashiv <noreply@kreashiv.cloud>",

        to: email,

        subject:
          "Reset Your Password",

        html: `
          <div style="font-family:sans-serif;padding:20px;">

            <h2>
              Reset Your Password
            </h2>

            <p>
              Click below to reset password.
            </p>

            <a
              href="${resetLink}"
              style="
                background:#7c3aed;
                color:white;
                padding:12px 20px;
                border-radius:8px;
                text-decoration:none;
                display:inline-block;
              "
            >
              Reset Password
            </a>

          </div>
        `,
      });

      res.json({
        success: true,
      });

    } catch (error) {

  console.log("RESET PASSWORD ERROR:");
  console.log(error);

  res.status(500).json({
    success: false,
    error: error.message,
  });
}
  }
);

module.exports = router;