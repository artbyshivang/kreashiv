import { getApp } from "@react-native-firebase/app";
import {
    initializeAppCheck,
    ReactNativeFirebaseAppCheckProvider,
} from "@react-native-firebase/app-check";
import { Platform } from "react-native";

import Constants from "expo-constants";

let appCheckInstance = null;

// ============================================================
// DEBUG TOKEN — Preview aur DEV builds ke liye
// app.config.js mein appEnv = "preview" set hota hai EAS build time pe
// ============================================================
const APP_CHECK_DEBUG_TOKEN = "91FC53CF-9444-433D-BC01-4D59FB31143B";

// app.config.js pe set hota hai build time pe — 100% reliable
const appEnv = Constants.expoConfig?.extra?.appEnv || "production";
const USE_DEBUG_PROVIDER = __DEV__ || appEnv === "preview";

export async function initializeFirebaseAppCheck() {
  try {
    const provider = new ReactNativeFirebaseAppCheckProvider();

    provider.configure({
      android: {
        provider: USE_DEBUG_PROVIDER ? "debug" : "playIntegrity",
        debugToken: USE_DEBUG_PROVIDER ? APP_CHECK_DEBUG_TOKEN : undefined,
      },
      apple: {
        provider: USE_DEBUG_PROVIDER ? "debug" : "deviceCheck",
        debugToken: USE_DEBUG_PROVIDER ? APP_CHECK_DEBUG_TOKEN : undefined,
      },
      isTokenAutoRefreshEnabled: true,
    });

    appCheckInstance = await initializeAppCheck(getApp(), {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    console.log(
      "✅ Firebase App Check initialized (" +
      Platform.OS +
      " | " +
      (__DEV__ ? "DEBUG mode" : "PRODUCTION mode") +
      ")"
    );

    return appCheckInstance;
  } catch (error) {
    console.warn("⚠️ App Check initialization failed:", error?.message || error);
    return null;
  }
}

export function getAppCheckInstance() {
  return appCheckInstance;
}