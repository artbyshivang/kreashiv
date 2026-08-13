import * as IAP from "expo-iap";

export const PRODUCT_IDS = {
    MONTHLY: "premium_monthly",
    QUARTERLY: "premium_quarterly",
};

class BillingService {
    constructor() {
        this.connected = false;
    }

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

    async disconnect() {
        try {
            await IAP.endConnection();
            this.connected = false;
        } catch (e) { }
    }

    async getSubscriptions() {
        try {
            return await IAP.getSubscriptionsAsync([
                PRODUCT_IDS.MONTHLY,
                PRODUCT_IDS.QUARTERLY,
            ]);
        } catch (error) {
            console.log("Subscription Load Error:", error);
            return [];
        }
    }
}

export default new BillingService();