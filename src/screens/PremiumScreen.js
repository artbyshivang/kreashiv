import { Ionicons } from "@expo/vector-icons";

import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/Header";
import billingService, { PRODUCT_IDS } from "../services/billingService";
import { ThemeContext } from "../theme/ThemeContext";

import { useNavigation } from "@react-navigation/native";
import CustomAlert from "../components/CustomAlert";
import { UserContext } from "../context/UserContext";

export default function PremiumScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(UserContext);

  const isPremiumUser = user?.premium || false;

  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);

  // DYNAMIC CURRENCY & LOCATION STATE
  const [countryCode, setCountryCode] = useState("IN");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    detectLocation();
    initializeBilling();

    return () => {
      billingService.disconnect();
    };
  }, []);

  const detectLocation = async () => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      let detectedIsIndia = timeZone.includes("Kolkata") || timeZone.includes("Calcutta");

      if (!detectedIsIndia) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data && data.country_code) {
          detectedIsIndia = data.country_code === "IN";
        }
      }

      setCountryCode(detectedIsIndia ? "IN" : "US");
    } catch (e) {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const isIndiaTimezone = timeZone.includes("Kolkata") || timeZone.includes("Calcutta");
      setCountryCode(isIndiaTimezone ? "IN" : "US");
    }
  };

  const initializeBilling = async () => {
    const connected = await billingService.connect();

    if (!connected) {
      console.log("Billing connection failed");
      return;
    }

    // Setup purchase listeners — these fire when Google Play confirms a purchase
    billingService.setPurchaseListeners({
      onSuccess: async (purchase) => {
        setLoading(false);
        if (user?.uid) {
          const result = await billingService.savePremiumToFirestore(user.uid, purchase);
          if (result?.success) {
            // Update local user state immediately (Firestore listener will also sync)
            setUser((prev) => ({
              ...prev,
              premium: true,
              planType: result.planType,
              credits: result.credits,
            }));
            showAlert(
              "🎉 Welcome to Premium!",
              "Your subscription is now active. Enjoy all premium features!"
            );
            navigation.goBack();
          } else {
            showAlert(
              "Purchase Successful",
              "Payment done! If premium doesn't activate, please contact support."
            );
          }
        }
      },
      onError: (error) => {
        setLoading(false);
        showAlert(
          "Purchase Failed",
          "Something went wrong. Please try again or contact support."
        );
      },
    });

    const products = await billingService.getSubscriptions();
    setSubscriptions(products);
    console.log("Subscriptions loaded:", products);
  };




  const prices = countryCode === "IN" ? {
    free: "₹0",
    monthly: "₹149",
    quarterly: "₹399",
    miniBooster: "₹49",
    powerBooster: "₹89",
  } : {
    free: "$0",
    monthly: "$1.99",
    quarterly: "$4.99",
    miniBooster: "$0.99",
    powerBooster: "$1.49",
  };

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleUpgrade = async () => {
    if (!user?.uid) {
      showAlert("Error", "Please log in first.");
      return;
    }

    if (selectedPlan === "free") {
      showAlert(
        "Free Plan",
        "You are already using the Free Plan."
      );
      return;
    }

    if (isPremiumUser) {
      showAlert(
        "Already Premium",
        "You already have an active premium subscription!"
      );
      return;
    }

    setLoading(true);

    // Make sure billing is connected before purchase
    const connected = await billingService.connect();
    if (!connected) {
      setLoading(false);
      showAlert(
        "Connection Error",
        "Could not connect to Google Play. Please check your internet and try again."
      );
      return;
    }

    // Map selected plan to product ID
    const productId =
      selectedPlan === "quarterly"
        ? PRODUCT_IDS.QUARTERLY
        : PRODUCT_IDS.MONTHLY;

    // This opens the Google Play payment sheet
    const result = await billingService.purchaseSubscription(productId);

    if (result.cancelled) {
      // User pressed back on Google Play sheet — no error shown
      setLoading(false);
      return;
    }

    if (!result.success) {
      setLoading(false);
      showAlert(
        "Purchase Failed",
        "Could not initiate purchase. Please try again."
      );
    }
    // If success: the purchaseUpdatedListener (in initializeBilling) handles the rest
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const connected = await billingService.connect();
      if (!connected) {
        setLoading(false);
        showAlert("Error", "Could not connect to Google Play.");
        return;
      }

      const purchases = await billingService.restorePurchases();

      if (purchases.length === 0) {
        setLoading(false);
        showAlert("No Purchases Found", "No active subscriptions found for your account.");
        return;
      }

      // Find the most recent active subscription
      const activeSub = purchases.find(
        (p) => p.productId === PRODUCT_IDS.MONTHLY || p.productId === PRODUCT_IDS.QUARTERLY
      );

      if (activeSub && user?.uid) {
        await billingService.finishPurchase(activeSub);
        await billingService.savePremiumToFirestore(user.uid, activeSub);
        setUser((prev) => ({
          ...prev,
          premium: true,
          planType: activeSub.productId === PRODUCT_IDS.QUARTERLY ? "quarterly" : "monthly",
        }));
        showAlert("✅ Restored!", "Your premium subscription has been restored.");
        navigation.goBack();
      } else {
        showAlert("Not Found", "No active premium subscription found to restore.");
      }
    } catch (e) {
      showAlert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <Header />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View
          style={{
            alignItems: "center",
            marginTop: 25,
            marginBottom: 30,
          }}
        >
          <View
            style={{
              width: 85,
              height: 85,
              borderRadius: 45,
              backgroundColor:
                theme.background === "#0f172a"
                  ? "#14532d"
                  : "#dcfce7",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Ionicons
              name="sparkles-outline"
              size={34}
              color={theme.primary}
            />
          </View>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: theme.text,
              textAlign: "center",
              lineHeight: 38,
            }}
          >
            Upgrade Your{"\n"}Creative Power
          </Text>

          <Text
            style={{
              textAlign: "center",
              color: theme.subText,
              marginTop: 12,
              lineHeight: 22,
            }}
          >
            Unlock premium AI quality, faster generations,
            advanced styles, ad-free experience and more.
          </Text>
        </View>

        {/* FEATURES */}
        <Feature
          icon="flash"
          title="High Quality AI Output"
          desc="Better prompts with premium quality generation"
          theme={theme}
        />

        <Feature
          icon="sparkles"
          title="Exclusive AI Features"
          desc="Advanced prompt styles & creative tools"
          theme={theme}
        />

        <Feature
          icon="rocket-outline"
          title="Faster Processing"
          desc="Priority servers for faster results"
          theme={theme}
        />

        <Feature
          icon="ban"
          title="Ad-Free Experience"
          desc="Enjoy uninterrupted creativity"
          theme={theme}
        />

        {/* FREE PLAN */}
        <PlanCard
          title="Free Plan"
          price={prices.free}
          subtitle="Perfect to get started"
          points={[
            "Ads Supported",
            "15 Prompts / Day",
            "Basic AI Quality",
            "Limited Features",
          ]}
          selected={selectedPlan === "free"}
          onPress={() => setSelectedPlan("free")}
          theme={theme}
        />

        {/* MONTHLY */}
        <PlanCard
          title="Monthly Pro"
          price={prices.monthly}
          subtitle="/month"
          badge="MOST POPULAR"
          points={[
            "Ad-Free Experience",
            "1,000 Credits / Month",
            "Premium AI Quality",
            "All Aspect Ratios",
            "Exclusive Features",
            "Fast Generation",
          ]}
          selected={selectedPlan === "monthly"}
          onPress={() => setSelectedPlan("monthly")}
          highlight
          theme={theme}
        />

        {/* QUARTERLY */}
        <PlanCard
          title="Quarterly Pro"
          price={prices.quarterly}
          subtitle="/3 months"
          badge="SAVE 11%"
          points={[
            "3,000 Credits Total",
            "Ad-Free Experience",
            "Premium AI Quality",
            "Exclusive Features",
            "Priority Processing",
            "Best Value Plan",
          ]}
          selected={selectedPlan === "quarterly"}
          onPress={() => setSelectedPlan("quarterly")}
          theme={theme}
        />

        {/* BOOSTERS TITLE */}
        {isPremiumUser && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.text,
                marginTop: 28,
                marginBottom: 12,
              }}
            >
              Credit Boosters
            </Text>

            {/* BOOSTERS */}
            <View style={{ flexDirection: "row" }}>
              <BoosterCard
                icon="flash"
                title="Mini Booster"
                price={prices.miniBooster}
                credits="500 Credits"
                desc="Perfect for quick top-ups"
                theme={theme}
              />

              <BoosterCard
                icon="rocket"
                title="Power Booster"
                price={prices.powerBooster}
                credits="1,200 Credits"
                desc="Best for power users"
                highlight
                theme={theme}
              />
            </View>
          </>
        )}

        {/* UPGRADE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleUpgrade}
          disabled={loading}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 18,
            borderRadius: 50,
            alignItems: "center",
            marginTop: 35,
            marginBottom: 12,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            {loading ? "Processing..." : "Continue to Upgrade →"}
          </Text>
        </TouchableOpacity>

        {/* RESTORE PURCHASES — Required by Google Play policy */}
        {!isPremiumUser && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRestore}
            disabled={loading}
            style={{
              alignItems: "center",
              paddingVertical: 10,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: theme.subText,
                fontSize: 13,
                textDecorationLine: "underline",
              }}
            >
              Restore Purchases
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

/* =========================
   PLAN CARD
========================= */

function PlanCard({
  title,
  price,
  subtitle,
  points,
  selected,
  onPress,
  badge,
  highlight,
  theme,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        backgroundColor: selected
          ? theme.primary
          : theme.card,
        borderRadius: 24,
        padding: 18,
        marginTop: 18,
        borderWidth: 2,
        borderColor: selected
          ? theme.primary
          : theme.border,
      }}
    >
      {/* BADGE */}
      {badge && (
        <View
          style={{
            alignSelf: "flex-start",
            backgroundColor: highlight
              ? "#fff"
              : theme.primary,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 50,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: highlight
                ? theme.primary
                : "#fff",
            }}
          >
            {badge}
          </Text>
        </View>
      )}

      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "800",
          color: selected ? "#fff" : theme.text,
        }}
      >
        {title}
      </Text>

      {/* PRICE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginTop: 6,
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: "900",
            color: selected ? "#fff" : theme.text,
          }}
        >
          {price}
        </Text>

        <Text
          style={{
            marginLeft: 5,
            marginBottom: 5,
            color: selected
              ? "#e2e8f0"
              : theme.subText,
          }}
        >
          {subtitle}
        </Text>
      </View>

      {/* FEATURES */}
      <View style={{ marginTop: 16 }}>
        {points.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={selected ? "#fff" : theme.primary}
            />

            <Text
              style={{
                marginLeft: 10,
                color: selected ? "#fff" : theme.text,
                fontSize: 14,
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

/* =========================
   FEATURE
========================= */

function Feature({ icon, title, desc, theme }) {
  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 18,
        padding: 15,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          width: 45,
          height: 45,
          borderRadius: 14,
          backgroundColor:
            theme.background === "#0f172a"
              ? "#1e293b"
              : "#f1f5f9",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={theme.primary}
        />
      </View>

      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text
          style={{
            fontWeight: "700",
            fontSize: 15,
            color: theme.text,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: theme.subText,
            marginTop: 3,
            fontSize: 12,
          }}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}

/* =========================
   BOOSTER CARD
========================= */

function BoosterCard({
  icon,
  title,
  price,
  credits,
  desc,
  highlight,
  theme,
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: highlight
          ? theme.primary
          : theme.card,
        borderRadius: 22,
        padding: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: highlight
          ? theme.primary
          : theme.border,
      }}
    >
      <Ionicons
        name={icon}
        size={22}
        color={highlight ? "#fff" : theme.primary}
      />

      <Text
        style={{
          marginTop: 10,
          fontWeight: "800",
          fontSize: 16,
          color: highlight ? "#fff" : theme.text,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 22,
          fontWeight: "900",
          marginTop: 6,
          color: highlight ? "#fff" : theme.text,
        }}
      >
        {price}
      </Text>

      <Text
        style={{
          marginTop: 6,
          color: highlight
            ? "#e2e8f0"
            : theme.primary,
          fontWeight: "700",
        }}
      >
        {credits}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 12,
          lineHeight: 18,
          color: highlight
            ? "#f8fafc"
            : theme.subText,
        }}
      >
        {desc}
      </Text>
    </View>
  );
}