import { getApp } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";

let app = null;
let db = null;

try {
  app = getApp();
  db = getFirestore(app);
} catch (error) {
  console.warn("React Native Firebase default app error:", error?.message || error);
}

export { db };
export default app;