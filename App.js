import React, { useContext, useEffect, Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import ThemeProvider, { ThemeContext } from "./src/theme/ThemeContext";
import { UserProvider } from "./src/context/UserContext";
import "./src/firebase/test";
import * as Notifications from "expo-notifications";
import mobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";

// Configure how notifications are handled when the app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log("Notification handler error:", e);
}

try {
  if (typeof mobileAds === "function") {
    mobileAds()
      .initialize()
      .then(() => {
        console.log("AdMob Initialized");
      })
      .catch((err) => {
        console.log("AdMob Initialization error:", err);
      });
  }
} catch (e) {
  console.log("AdMob init error:", e);
}

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Global Error Boundary caught an error:", error, errorInfo);
    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: "#f87171",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#0d9488",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

function AppContent() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme.background === "#0f172a";

  useEffect(() => {
    // Hide splash screen immediately and with fallbacks for standalone APKs
    SplashScreen.hideAsync().catch(() => {});

    const t1 = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 200);
    const t2 = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 800);
    const t3 = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

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
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}