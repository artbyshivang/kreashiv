import express from "express";
import admin from "../firebaseAdmin.js";

const router = express.Router();

router.post("/use-credit", async (req, res) => {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // 2. Get Firebase ID token
    const idToken = authHeader.split("Bearer ")[1];

    // 3. Verify token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 4. User Firestore document
    const userRef = admin.firestore().collection("users").doc(uid);

    // 5. Atomically deduct 1 credit
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const userData = userSnap.data();
      const currentCredits = Number(userData.credits ?? 0);

      if (currentCredits <= 0) {
        throw new Error("NO_CREDITS");
      }

      const newCredits = currentCredits - 1;

      transaction.update(userRef, {
        credits: newCredits,
      });

      return newCredits;
    });

    return res.json({
      success: true,
      credits: result,
    });
  } catch (error) {
    console.error("Use credit error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (error.message === "NO_CREDITS") {
      return res.status(403).json({
        success: false,
        error: "No credits remaining",
      });
    }

    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error" ||
      error.code === "auth/invalid-id-token"
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to use credit",
    });
  }
});

export default router;