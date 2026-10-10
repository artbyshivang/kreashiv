import { getApp } from "@react-native-firebase/app";

try {
  const app = getApp();
  console.log("Firebase App Connected:", app?.name);
} catch (e) {
  console.log("Firebase App not yet initialized:", e?.message || e);
}