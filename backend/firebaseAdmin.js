import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  try {
    // Try Render's Secret File path first
    serviceAccount = JSON.parse(
      fs.readFileSync("/etc/secrets/my-kreashiv-app-firebase-adminsdk-fbsvc-08dd24a212.json")
    );
  } catch (error) {
    // Fallback to local path
    serviceAccount = JSON.parse(
      fs.readFileSync(
        new URL("./my-kreashiv-app-firebase-adminsdk-fbsvc-08dd24a212.json", import.meta.url)
      )
    );
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;