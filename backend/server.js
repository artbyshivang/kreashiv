import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

import resetPasswordRoute from "./routes/resetPassword.js";
import verifyEmailRoute from "./routes/verifyEmail.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", resetPasswordRoute);
app.use("/api", verifyEmailRoute);




const resend = new Resend(process.env.RESEND_API_KEY);



/* HOME */

app.get("/", (req, res) => {
    res.send("Backend Running");
});



/* SEND RESET EMAIL */





/* SEND VERIFY EMAIL */




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});