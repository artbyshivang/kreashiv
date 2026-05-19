import admin from "firebase-admin";

import serviceAccount
from "./my-kreashiv-app-firebase-adminsdk-fbsvc-08dd24a212.json";

admin.initializeApp({
  credential: admin.credential.cert(
    serviceAccount
  ),
});

export default admin;