import React, {
  useContext
} from "react";
import {
  createNativeStackNavigator
} from "@react-navigation/native-stack";

import TabNavigator from "./TabNavigator";
import { ThemeContext } from "../theme/ThemeContext";

import ProfileScreen
  from "../screens/ProfileScreen";

import VerifyEmailScreen
  from "../screens/VerifyEmailScreen";

import SettingsScreen
  from "../screens/SettingsScreen";

import LoginScreen
  from "../screens/LoginScreen";

import SignupScreen
  from "../screens/SignupScreen";

import ForgotPasswordScreen
  from "../screens/ForgotPasswordScreen";

import FolderScreen
  from "../screens/FolderScreen";


import PremiumScreen
  from "../screens/PremiumScreen";



import ManagePlanScreen
  from "../screens/ManagePlanScreen";

import {
  UserContext
} from "../context/UserContext";


import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsScreen from "../screens/TermsScreen";
import HelpCenterScreen from "../screens/HelpCenterScreen";

const Stack =
  createNativeStackNavigator();

export default function RootNavigator() {
  const { theme } = useContext(ThemeContext);

  const {
    user,
    loading,
  } = useContext(UserContext);

  if (loading) {
    return null;
  }



  return (

    <Stack.Navigator


      screenOptions={{
        headerShown: false,

        /* 🔥 SMOOTH NAVIGATION */
        animation: "fade",

        /* 🔥 PERFORMANCE */
        freezeOnBlur: true,

        /* 🔥 PREVENT FLASH */
        contentStyle: { backgroundColor: theme.background },
      }}
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