import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

import resetPasswordRoute
from "./routes/resetPassword.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/api",
  resetPasswordRoute
);



const resend = new Resend(process.env.RESEND_API_KEY);



/* HOME */

app.get("/", (req, res) => {
    res.send("Backend Running");
});



/* SEND RESET EMAIL */





/* SEND VERIFY EMAIL */




app.listen(5000, () => {
    console.log("Server running on port 5000");
});