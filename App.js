import React, { useContext } from "react";
import { View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import ThemeProvider, { ThemeContext } from "./src/theme/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import "./src/firebase/test";
import * as Notifications from "expo-notifications";
import mobileAds from "react-native-google-mobile-ads";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


mobileAds()
  .initialize()
  .then(() => {
    console.log("AdMob Initialized");
  });

function AppContent() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.background === "#0f172a";

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}