import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import * as SplashScreen from "expo-splash-screen";
import { Component, useContext, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "./src/context/UserContext";
import { initializeFirebaseAppCheck } from "./src/firebase/appCheck";
import RootNavigator from "./src/navigation/RootNavigator";

// ============================================
// APP CHECK — Module level (runs BEFORE React mounts)
// Ensures App Check token is ready before any Firestore calls
// ============================================
initializeFirebaseAppCheck().catch((e) => {
  console.warn("App Check module-level init error:", e?.message || e);
});

import ThemeProvider, { ThemeContext } from "./src/theme/ThemeContext";

async function initializeNativeSDKs() {
  // ============================================
  // NOTIFICATIONS
  // ============================================
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.log(
      "Notification handler error:",
      e?.message || e
    );
  }

  // ============================================
  // ADMOB
  // ============================================
  try {
    if (typeof mobileAds === "function") {
      mobileAds()
        .initialize()
        .then(() => {
          console.log("AdMob Initialized");
        })
        .catch((err) => {
          console.log(
            "AdMob Initialization error:",
            err?.message || err
          );
        });
    }
  } catch (e) {
    console.log(
      "AdMob init error:",
      e?.message || e
    );
  }
}

// ============================================
// ERROR BOUNDARY
// ============================================

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.log(
      "Global Error Boundary caught an error:",
      error,
      errorInfo
    );

    SplashScreen.hideAsync().catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Something went wrong
          </Text>

          <Text style={styles.errorText}>
            {this.state.error?.toString()}
          </Text>

          <TouchableOpacity
            style={styles.errorButton}
            onPress={() =>
              this.setState({
                hasError: false,
                error: null,
              })
            }
          >
            <Text style={styles.errorButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================
// STYLES
// ============================================

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

// ============================================
// APP CONTENT
// ============================================

function AppContent() {
  const { theme } = useContext(ThemeContext);

  const isDark = theme.background === "#0f172a";

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),

    colors: {
      ...(isDark
        ? DarkTheme.colors
        : DefaultTheme.colors),

      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function App() {
  useEffect(() => {
    initializeNativeSDKs();

    // Guaranteed splash hide on app startup
    SplashScreen.hideAsync().catch(() => {});

    const t1 = setTimeout(
      () => SplashScreen.hideAsync().catch(() => {}),
      300
    );

    const t2 = setTimeout(
      () => SplashScreen.hideAsync().catch(() => {}),
      1000
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <SafeAreaProvider>
            <AppContent />
          </SafeAreaProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}