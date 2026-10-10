// Dynamic Expo config — app.config.js
// Yeh file app.json ki jagah use hoti hai aur build time pe evaluate hoti hai.
// EAS build ke dauran process.env variables yahan available hote hain.

const APP_CHECK_DEBUG_TOKEN = "91FC53CF-9444-433D-BC01-4D59FB31143B";

// Preview ya development builds ke liye debug provider use karo
const isPreview = process.env.EXPO_PUBLIC_IS_PREVIEW === "true";
const isDev = process.env.NODE_ENV === "development";
const useDebugAppCheck = isPreview || isDev;

module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      // App Check — debug token sirf preview/dev builds ke liye
      [
        "@react-native-firebase/app-check",
        useDebugAppCheck
          ? { androidDebugToken: APP_CHECK_DEBUG_TOKEN }
          : {},
      ],
      ...(config.plugins || []).filter(
        (p) =>
          p !== "@react-native-firebase/app-check" &&
          !(Array.isArray(p) && p[0] === "@react-native-firebase/app-check")
      ),
    ],
    extra: {
      ...(config.extra || {}),
      // Build environment — JS code mein Constants.expoConfig.extra.appEnv se padhte hain
      appEnv: useDebugAppCheck ? "preview" : "production",
    },
  };
};
