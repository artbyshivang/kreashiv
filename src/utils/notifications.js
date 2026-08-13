import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission denied");
        return null;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "3354d086-2523-4e10-99c7-d16f9c3c47e9"
        })
      )?.data;

      console.log("Push Token:", token);
    }

    return token;
  } catch (error) {
    console.log("Notification token error:", error);
    return null;
  }
}