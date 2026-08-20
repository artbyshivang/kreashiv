import {
  createNativeStackNavigator
} from "@react-navigation/native-stack";
import {
  useContext
} from "react";

import { ThemeContext } from "../theme/ThemeContext";
import TabNavigator from "./TabNavigator";

import ProfileScreen from "../screens/ProfileScreen";

import VerifyEmailScreen from "../screens/VerifyEmailScreen";

import SettingsScreen from "../screens/SettingsScreen";

import LoginScreen from "../screens/LoginScreen";

import SignupScreen from "../screens/SignupScreen";

import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

import FolderScreen from "../screens/FolderScreen";


import PremiumScreen from "../screens/PremiumScreen";



import ManagePlanScreen from "../screens/ManagePlanScreen";

import {
  UserContext
} from "../context/UserContext";


import HelpCenterScreen from "../screens/HelpCenterScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsScreen from "../screens/TermsScreen";

import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Stack =
  createNativeStackNavigator();

export default function RootNavigator() {
  const { theme } = useContext(ThemeContext);
   const insets = useSafeAreaInsets();

  const {
    user,
    loading,
  } = useContext(UserContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }



  return (

    <Stack.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,

    /* SMOOTH NAVIGATION */
    animation: "fade",

    /* PERFORMANCE */
    freezeOnBlur: true,

    /* SAFE AREA */
    contentStyle: {
      backgroundColor: theme.background,

      /*
       * MainTabs already handles bottom safe-area
       * inside TabNavigator.
       *
       * Other Stack screens need bottom inset
       * so content does not overlap Android navigation buttons.
       */
      paddingBottom:
        route.name === "MainTabs"
          ? 0
          : insets.bottom,
    },
  })}
>

     {
  !user ? (
    <>
      {/* LOGIN */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      {/* SIGNUP */}
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
      />
    </>
  ) : !user.emailVerified ? (
    <>
      {/* VERIFY EMAIL */}
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
      />
    </>
  ) : (
    <>
      {/* MAIN APP */}
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
      />

      {/* PROFILE */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />

      {/* SETTINGS */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      {/* FOLDER */}
      <Stack.Screen
        name="Folder"
        component={FolderScreen}
      />

      {/* PREMIUM */}
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
      />

      {/* MANAGE PLAN */}
      <Stack.Screen
        name="ManagePlan"
        component={ManagePlanScreen}
      />
    </>
  )
}


      {/* FORGOT PASSWORD */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

{/* PRIVACY POLICY */}
<Stack.Screen
  name="PrivacyPolicy"
  component={PrivacyPolicyScreen}
/>

{/* TERMS */}
<Stack.Screen
  name="Terms"
  component={TermsScreen}
/>

{/* HelpCenter */}
<Stack.Screen
  name="HelpCenter"
  component={HelpCenterScreen}
/>




    </Stack.Navigator>

  );
}