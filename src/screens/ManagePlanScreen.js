import { useContext, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { ThemeContext } from "../theme/ThemeContext";


export default function ManagePlanScreen() {
    const navigation = useNavigation();

    const { theme } = useContext(ThemeContext);

    const { user, setUser } = useContext(UserContext);

    const isPremiumUser = user?.premium || false;

    const [showCancelAlert, setShowCancelAlert] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const todayDate = new Date().toISOString().split("T")[0];
    const dailyUsed = user?.dailyUsage?.date === todayDate ? (user?.dailyUsage?.count || 0) : 0;
    const remainingDaily = Math.max(0, 15 - dailyUsed);

    const proCredits = user?.credits ?? 1000;

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.background,
            }}
        >
            {/* HEADER */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingTop: 52,
                    paddingBottom: 18,
                    backgroundColor: theme.card,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={theme.primary}
                    />
                </TouchableOpacity>

                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: theme.text,
                    }}
                >
                    Manage Plan
                </Text>

                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40,
                }}
            >

                {/* ACTIVE PLAN CARD */}
                <View
                    style={{
                        backgroundColor: isPremiumUser
                            ? theme.primary
                            : theme.card,
                        borderRadius: 30,
                        padding: 22,
                        borderWidth: 1,
                        borderColor: isPremiumUser
                            ? theme.primary
                            : theme.border,
                    }}
                >

                    {/* TOP */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 18,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: isPremiumUser
                                        ? "rgba(255,255,255,0.18)"
                                        : theme.background,
                                }}
                            >
                                <Ionicons
                                    name={
                                        isPremiumUser
                                            ? "diamond"
                                            : "lock-closed"
                                    }
                                    size={26}
                                    color={
                                        isPremiumUser
                                            ? "#fff"
                                            : theme.primary
                                    }
                                />
                            </View>

                            <View style={{ marginLeft: 14 }}>
                                <Text
                                    style={{
                                        fontSize: 24,
                                        fontWeight: "900",
                                        color: isPremiumUser
                                            ? "#fff"
                                            : theme.text,
                                    }}
                                >
                                    {isPremiumUser
                                        ? "Monthly Pro"
                                        : "Free Plan"}
                                </Text>

                                <Text
                                    style={{
                                        marginTop: 4,
                                        color: isPremiumUser
                                            ? "#dcfce7"
                                            : theme.subText,
                                    }}
                                >
                                    {isPremiumUser
                                        ? "Active Subscription"
                                        : "15 Prompts / Day"}
                                </Text>
                            </View>
                        </View>

                        <View
                            style={{
                                backgroundColor: isPremiumUser
                                    ? "rgba(255,255,255,0.18)"
                                    : "#22c55e20",
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 999,
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "800",
                                    color: isPremiumUser
                                        ? "#fff"
                                        : "#22c55e",
                                }}
                            >
                                {isPremiumUser ? "ACTIVE" : "FREE"}
                            </Text>
                        </View>
                    </View>

                    {/* DIVIDER */}
                    <View
                        style={{
                            height: 1,
                            backgroundColor: isPremiumUser
                                ? "rgba(255,255,255,0.15)"
                                : theme.border,
                            marginVertical: 20,
                        }}
                    />

                    {/* PLAN DETAILS */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <PlanItem
                            label="Plan Type"
                            value={isPremiumUser ? "Monthly" : "Free"}
                            light={isPremiumUser}
                            theme={theme}
                        />

                        <PlanItem
                            label="Reset"
                            value={isPremiumUser ? "Monthly" : "Daily"}
                            light={isPremiumUser}
                            theme={theme}
                        />

                        <PlanItem
                            label={isPremiumUser ? "Credits" : "Remaining"}
                            value={isPremiumUser ? `${proCredits}` : `${remainingDaily}`}
                            theme={theme}
                            light={isPremiumUser}
                        />
                    </View>

                    {/* USAGE PROGRESS BAR (REAL TIME) */}
                    <View style={{ marginTop: 24 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <Text
                                style={{
                                    color: isPremiumUser ? "#fff" : theme.text,
                                    fontWeight: "700",
                                }}
                            >
                                {isPremiumUser ? "Monthly Credits" : "Daily Prompts Used"}
                            </Text>

                            <Text
                                style={{
                                    color: isPremiumUser ? "#fff" : theme.text,
                                    fontWeight: "700",
                                }}
                            >
                                {isPremiumUser ? `${proCredits} / 1000` : `${dailyUsed} / 15`}
                            </Text>
                        </View>

                        <View
                            style={{
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: isPremiumUser
                                    ? "rgba(255,255,255,0.18)"
                                    : theme.border,
                                overflow: "hidden",
                            }}
                        >
                            <View
                                style={{
                                    width: isPremiumUser
                                        ? `${Math.min(100, Math.round((proCredits / 1000) * 100))}%`
                                        : `${Math.min(100, Math.round((dailyUsed / 15) * 100))}%`,
                                    height: "100%",
                                    backgroundColor: isPremiumUser ? "#fff" : theme.primary,
                                    borderRadius: 999,
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <Text
                    style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: theme.subText,
                        marginTop: 28,
                        marginBottom: 12,
                    }}
                >
                    QUICK ACTIONS
                </Text>

                {isPremiumUser && (
                    <ActionCard
                        icon="flash"
                        title="Buy Credit Booster"
                        desc="Get extra credits instantly"
                        theme={theme}
                        onPress={() => navigation.navigate("Premium")}
                    />
                )}

                <ActionCard
                    icon="rocket-outline"
                    title="Upgrade Plan"
                    desc="Switch to a better subscription"
                    theme={theme}
                    onPress={() => navigation.navigate("Premium")}
                />



                {/* DANGER ZONE */}
                {isPremiumUser && (
                    <>
                        <Text
                            style={{
                                fontSize: 13,
                                fontWeight: "800",
                                color: "#ef4444",
                                marginTop: 28,
                                marginBottom: 12,
                            }}
                        >
                            DANGER ZONE
                        </Text>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setShowCancelAlert(true)}
                            style={{
                                backgroundColor: theme.card,
                                borderRadius: 22,
                                padding: 18,
                                borderWidth: 1,
                                borderColor: "#ef444450",
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <View
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 14,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: "#ef444420",
                                    }}
                                >
                                    <Ionicons
                                        name="close-circle-outline"
                                        size={22}
                                        color="#ef4444"
                                    />
                                </View>

                                <View style={{ marginLeft: 14, flex: 1 }}>
                                    <Text
                                        style={{
                                            fontWeight: "800",
                                            fontSize: 16,
                                            color: "#ef4444",
                                        }}
                                    >
                                        Cancel Subscription
                                    </Text>

                                    <Text
                                        style={{
                                            marginTop: 4,
                                            color: theme.subText,
                                            lineHeight: 20,
                                        }}
                                    >
                                        Your plan will remain active
                                        until the billing period ends.
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

            </ScrollView>

            <CustomAlert
                visible={showCancelAlert}
                title="Cancel Subscription?"
                message="Are you sure you want to cancel your subscription?"
                onClose={() => setShowCancelAlert(false)}
                showCancel={true}
                cancelText="Keep Plan"
                confirmText="Cancel"
                danger={true}
                onConfirm={async () => {
                    try {
                        setShowCancelAlert(false);
                        if (user?.uid) {
                            const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
                            const response = await fetch(`${apiUrl}/api/cancel-premium`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ uid: user.uid }),
                            });
                            const data = await response.json();
                            if (data.success) {
                                setUser({
                                    ...user,
                                    premium: false,
                                    planType: null,
                                });
                                showAlert(
                                    "Subscription Cancelled",
                                    "Your subscription has been cancelled successfully."
                                );
                            } else {
                                showAlert("Error", "Failed to cancel. Please try again.");
                            }
                        }
                    } catch (error) {
                        console.log("Cancel subscription error:", error);
                        showAlert("Error", "Failed to cancel subscription. Please try again.");
                    }
                }}
            />

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
   PLAN ITEM
========================= */

function PlanItem({
    label,
    value,
    light,
    theme,
}) {
    return (
        <View style={{ alignItems: "center", flex: 1 }}>
            <Text
                style={{
                    color: light
                        ? "#dcfce7"
                        : "#64748b",
                    fontSize: 12,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    marginTop: 5,
                    fontSize: 18,
                    fontWeight: "900",
                    color: light
                        ? "#fff"
                        : theme.text,
                }}
            >
                {value}
            </Text>
        </View>
    );
}

/* =========================
   FEATURE
========================= */

function Feature({
    icon,
    text,
}) {
    return (
        <View style={{ alignItems: "center", flex: 1 }}>
            <Ionicons
                name={icon}
                size={20}
                color="#fff"
            />

            <Text
                style={{
                    color: "#fff",
                    marginTop: 6,
                    fontWeight: "700",
                }}
            >
                {text}
            </Text>
        </View>
    );
}

/* =========================
   ACTION CARD
========================= */

function ActionCard({
    icon,
    title,
    desc,
    theme,
    onPress,
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={{
                backgroundColor: theme.card,
                borderRadius: 22,
                padding: 18,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor:
                            theme.background === "#0f172a"
                                ? "#0f172a"
                                : "#f1f5f9",
                    }}
                >
                    <Ionicons
                        name={icon}
                        size={22}
                        color={theme.primary}
                    />
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: theme.text,
                        }}
                    >
                        {title}
                    </Text>

                    <Text
                        style={{
                            marginTop: 4,
                            color: theme.subText,
                            lineHeight: 20,
                        }}
                    >
                        {desc}
                    </Text>
                </View>

                <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={theme.subText}
                />





            </View>
        </TouchableOpacity>
    );
}