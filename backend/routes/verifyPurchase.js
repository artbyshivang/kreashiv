import express from "express";
import admin from "../firebaseAdmin.js";

const router = express.Router();

const db = admin.firestore();

// Plan ID → credits mapping
const PLAN_CREDITS = {
    premium_monthly: 1000,
    premium_quarterly: 3000,
};

const PLAN_TYPE = {
    premium_monthly: "monthly",
    premium_quarterly: "quarterly",
};

/**
 * POST /api/verify-purchase
 * 
 * Body: {
 *   uid: string,
 *   productId: string,       // "premium_monthly" | "premium_quarterly"
 *   purchaseToken: string,   // from Google Play
 *   transactionId: string,   // optional fallback
 * }
 */
router.post("/verify-purchase", async (req, res) => {
    const { uid, productId, purchaseToken, transactionId } = req.body;

    // Basic validation
    if (!uid || !productId) {
        return res.status(400).json({ success: false, error: "Missing uid or productId" });
    }

    if (!PLAN_CREDITS[productId]) {
        return res.status(400).json({ success: false, error: "Invalid productId" });
    }

    try {
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const planType = PLAN_TYPE[productId];
        const credits = PLAN_CREDITS[productId];
        const token = purchaseToken || transactionId || null;

        // Update Firestore with premium status
        await userRef.update({
            premium: true,
            planType: planType,
            purchaseToken: token,
            purchaseProductId: productId,
            premiumSince: new Date().toISOString(),
            credits: credits,
        });

        console.log(`✅ Premium activated for uid: ${uid}, plan: ${planType}`);

        return res.json({
            success: true,
            planType,
            credits,
        });

    } catch (error) {
        console.error("verify-purchase error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

/**
 * POST /api/cancel-premium
 * 
 * Body: { uid: string }
 * Called when user cancels from ManagePlanScreen
 */
router.post("/cancel-premium", async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ success: false, error: "Missing uid" });
    }

    try {
        const userRef = db.collection("users").doc(uid);
        await userRef.update({
            premium: false,
            planType: null,
            purchaseToken: null,
        });

        return res.json({ success: true });
    } catch (error) {
        console.error("cancel-premium error:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
