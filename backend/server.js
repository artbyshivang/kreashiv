import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);



/* HOME */

app.get("/", (req, res) => {
    res.send("Backend Running");
});



/* SEND RESET EMAIL */

app.post("/send-reset-email", async (req, res) => {

    try {

        const { email } = req.body;

        const response = await resend.emails.send({

            from: "Kreashiv <noreply@kreashiv.cloud>",

            to: email,

            subject: "Reset your Kreashiv password",

            html: `
                <div style="font-family:sans-serif;padding:20px;">
                    
                    <h2>Reset Password</h2>

                    <p>
                        Click below to reset your password.
                    </p>

                    <a 
                        href="https://kreashiv.cloud/reset-password"
                        style="
                            background:#7c3aed;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:8px;
                            display:inline-block;
                            margin-top:10px;
                        "
                    >
                        Reset Password
                    </a>

                </div>
            `,
        });

        res.status(200).json(response);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error,
        });
    }
});



/* SEND VERIFY EMAIL */

app.post("/send-verification-email", async (req, res) => {

    try {

        const { email } = req.body;

        const response = await resend.emails.send({

            from: "Kreashiv <noreply@kreashiv.cloud>",

            to: email,

            subject: "Verify your Kreashiv account",

            html: `
                <div style="font-family:sans-serif;padding:20px;">

                    <h2>Verify Email</h2>

                    <p>
                        Click below to verify your account.
                    </p>

                    <a 
                        href="https://kreashiv.cloud/verify-email"
                        style="
                            background:#7c3aed;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:8px;
                            display:inline-block;
                            margin-top:10px;
                        "
                    >
                        Verify Email
                    </a>

                </div>
            `,
        });

        res.status(200).json(response);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error,
        });
    }
});



app.listen(5000, () => {
    console.log("Server running on port 5000");
});