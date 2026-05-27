import { getAuth } from "firebase/auth";
import app from "./config";

const auth = app ? getAuth(app) : null;

export default auth;