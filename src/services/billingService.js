import * as IAP from "expo-iap";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "";

export const PRODUCT_IDS = {
    MONTHLY: "premium_monthly",
    QUARTERLY: "premium_quarterly",
};

// Map product ID → plan type stored in Firestore
export const PLAN_MAP = {
    [PRODUCT_IDS.MONTHLY]: "monthly",
    [PRODUCT_IDS.QUARTERLY]: "quarterly",
};

class BillingService {
    constructor() {
        this.connected = false;
        this._purchaseListener = null;
        this._errorListener = null;
    }

    // ──────────────────────────────
    // CONNECT
    // ──────────────────────────────
    async connect() {
        if (this.connected) return true;

        try {
            await IAP.initConnection();
            this.connected = true;
            console.log("✅ Google Play Billing Connected");
            return true;
        } catch (error) {
            console.log("Billing Connection Error:", error);
            return false;
        }
    }

    // ──────────────────────────────
    // DISCONNECT
    // ──────────────────────────────
    async disconnect() {
        try {
            this.removePurchaseListeners();
            await IAP.endConnection();
            this.connected = false;
        } catch (e) {}
    }

    // ──────────────────────────────
    // GET SUBSCRIPTIONS (expo-iap v4.7+ API)
    // ──────────────────────────────
    async getSubscriptions() {
        try {
            // v4.7.0: fetchProducts({ skus, type: 'subs' })
            const products = await IAP.fetchProducts({
                skus: [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.QUARTERLY],
                type: "subs",
            });
            return products;
        } catch (error) {
            console.log("Subscription Load Error:", error);
            return [];
        }
    }

    // ──────────────────────────────
    // PURCHASE SUBSCRIPTION (expo-iap v4.7+ API)
    // ──────────────────────────────
    async purchaseSubscription(productId) {
        try {
            // Step 1: Fetch the subscription to get offerToken
            const products = await IAP.fetchProducts({
                skus: [productId],
                type: "subs",
            });

            console.log("Fetched products:", JSON.stringify(products));

            if (!products || products.length === 0) {
                console.log("❌ No product found for:", productId);
                return {
                    success: false,
                    error: { message: "Product not found in Play Store" },
                };
            }

            const sub = products[0];
            console.log("Subscription details:", JSON.stringify(sub));

            // Get offerToken — expo-iap v4.7.0 correct property names:
            // Primary:    sub.subscriptionOffers[0].offerToken   (new standardized)
            // Fallback:   sub.subscriptionOfferDetailsAndroid[0].offerToken  (deprecated but still works)
            const offerToken =
                sub?.subscriptionOffers?.[0]?.offerToken ||
                sub?.subscriptionOfferDetailsAndroid?.[0]?.offerToken ||
                null;

            console.log("offerToken:", offerToken);
            console.log("subscriptionOffers:", JSON.stringify(sub?.subscriptionOffers));
            console.log("subscriptionOfferDetailsAndroid:", JSON.stringify(sub?.subscriptionOfferDetailsAndroid));

            if (!offerToken) {
                console.log("❌ offerToken missing — base plan not active in Play Console?");
                return {
                    success: false,
                    error: { message: "offerToken missing — check Play Console base plan is ACTIVE" },
                };
            }

            // Step 2: Request the subscription (v4.7.0 API)
            await IAP.requestPurchase({
                request: {
                    google: {
                        skus: [productId],
                        subscriptionOffers: [{ sku: productId, offerToken }],
                    },
                },
                type: "subs",
            });

            // Result comes via purchaseUpdatedListener
            return { success: true };

        } catch (error) {
            console.log("Purchase Error code:", error?.code);
            console.log("Purchase Error message:", error?.message);
            console.log("Purchase Error full:", JSON.stringify(error));

            // User cancelled — not a real error
            if (
                error?.code === "E_USER_CANCELLED" ||
                error?.message?.toLowerCase().includes("cancel")
            ) {
                return { success: false, cancelled: true };
            }

            return { success: false, error };
        }
    }

    // ──────────────────────────────
    // RESTORE PURCHASES
    // ──────────────────────────────
    async restorePurchases() {
        try {
            const purchases = await IAP.getAvailablePurchases();
            return purchases;
        } catch (error) {
            console.log("Restore Error:", error);
            return [];
        }
    }

    // ──────────────────────────────
    // FINISH / ACKNOWLEDGE PURCHASE
    // ──────────────────────────────
    async finishPurchase(purchase) {
        try {
            await IAP.finishTransaction({ purchase, isConsumable: false });
        } catch (e) {
            console.log("Finish transaction error:", e);
        }
    }

    // ──────────────────────────────
    // VERIFY PURCHASE VIA BACKEND (Secure)
    // ──────────────────────────────
    async savePremiumToFirestore(uid, purchase) {
        try {
            const response = await fetch(`${API_URL}/api/verify-purchase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    productId: purchase.productId,
                    purchaseToken: purchase.purchaseToken || null,
                    transactionId: purchase.transactionId || null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("✅ Premium verified via backend:", data.planType);
                return { success: true, planType: data.planType, credits: data.credits };
            } else {
                console.log("❌ Backend verification failed:", data.error);
                return { success: false };
            }
        } catch (error) {
            console.log("Backend verify error:", error);
            return { success: false };
        }
    }

    // ──────────────────────────────
    // SETUP PURCHASE LISTENERS
    // Called once from PremiumScreen
    // ──────────────────────────────
    setPurchaseListeners({ onSuccess, onError }) {
        this.removePurchaseListeners();

        this._purchaseListener = IAP.purchaseUpdatedListener(async (purchase) => {
            console.log("📦 Purchase received:", purchase);

            const isSuccess =
                purchase.transactionReceipt ||
                purchase.purchaseToken ||
                purchase.transactionId;

            if (isSuccess) {
                // Acknowledge/finish the purchase with Google Play
                await this.finishPurchase(purchase);

                if (onSuccess) {
                    onSuccess(purchase);
                }
            }
        });

        this._errorListener = IAP.purchaseErrorListener((error) => {
            console.log("❌ Purchase error listener:", error);
            if (error.code !== "E_USER_CANCELLED" && onError) {
                onError(error);
            }
        });
    }

    removePurchaseListeners() {
        if (this._purchaseListener) {
            this._purchaseListener.remove();
            this._purchaseListener = null;
        }
        if (this._errorListener) {
            this._errorListener.remove();
            this._errorListener = null;
        }
    }
}

export default new BillingService();