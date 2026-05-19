import React, { useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";
import CountryPicker from "react-native-country-picker-modal";
import { UserContext } from "../context/UserContext";
import { clearHistory } from "../storage/historyStorage";
import { updateDoc } from "firebase/firestore";

import { deleteUser } from "firebase/auth";

import auth from "../firebase/auth";

import {
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";



export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [fieldTitle, setFieldTitle] = useState("");

  const [inputValue, setInputValue] = useState("");

  const [countryCode, setCountryCode] = useState("IN");

  const [callingCode, setCallingCode] = useState("91");

  const { theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(UserContext);

  const openEditor = (type) => {
    setFieldTitle(type);

    if (type === "Name") {
      setInputValue(user.name);
    }

    if (type === "Email") {
      setInputValue(user.email);
    }

    if (type === "Phone") {
      setInputValue(user.phone);
    }

    setModalVisible(true);
  };

  const handleClearHistory = () => {

    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all search history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Clear",
          style: "destructive",

          onPress: async () => {

            await clearHistory();

            Alert.alert(
              "Success",
              "History cleared successfully."
            );
          },
        },
      ]
    );
  };


  const handleDeleteAccount = () => {

    Alert.alert(
      "Delete Account",
      "This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {

            try {

              const currentUser =
                auth.currentUser;

              if (!currentUser) {
                return;
              }

              /* DELETE FIRESTORE DATA */

              await deleteDoc(
                doc(
                  db,
                  "users",
                  currentUser.uid
                )
              );

              /* DELETE AUTH ACCOUNT */

              await deleteUser(currentUser);

              /* LOGOUT */

              setUser(null);

              Alert.alert(
                "Success",
                "Account deleted successfully."
              );

            } catch (error) {

              console.log(error);

              Alert.alert(
                "Error",
                error.message
              );
            }
          },
        },
      ]
    );
  };






  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary }}>
          Settings
        </Text>

        <Ionicons name="person-circle-outline" size={26} color={theme.primary} />
      </View>



      {/* Edit My Profile Modal */}


      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 26,
              padding: 22,
            }}
          >

            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 18,
              }}
            >
              Edit {fieldTitle}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >

              {/* COUNTRY CODE INPUT */}
              {fieldTitle === "Phone" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    borderRightWidth: 1,
                    borderRightColor: theme.border,
                  }}
                >

                  <CountryPicker
                    withFilter
                    withFlag
                    withCallingCode
                    withEmoji
                    countryCode={countryCode}
                    onSelect={(country) => {
                      setCountryCode(country.cca2);

                      setCallingCode(
                        country.callingCode[0]
                      );
                    }}
                  />

                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "700",
                      marginLeft: 6,
                    }}
                  >
                    +{callingCode}
                  </Text>

                </View>
              )}




              {/* MAIN INPUT */}
              <TextInput
                value={inputValue}
                onChangeText={(text) => {

                  if (fieldTitle === "Phone") {

                    const cleaned =
                      text.replace(/[^0-9]/g, "");

                    const limited =
                      cleaned.slice(0, 10);

                    // Add space after 5 digits
                    const formatted =
                      limited.replace(
                        /(\d{5})(\d+)/,
                        "$1 $2"
                      );

                    setInputValue(formatted);

                  } else {
                    setInputValue(text);
                  }
                }}
                placeholder={
                  fieldTitle === "Phone"
                    ? "12345 67890"
                    : `Enter ${fieldTitle}`
                }
                placeholderTextColor={theme.subText}
                keyboardType={
                  fieldTitle === "Phone"
                    ? "number-pad"
                    : fieldTitle === "Email"
                      ? "email-address"
                      : "default"
                }
                maxLength={
                  fieldTitle === "Phone"
                    ? 11
                    : undefined
                }
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: theme.text,
                  fontSize: 16,
                }}
              />
            </View>

            {/* BUTTONS */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 22,
              }}
            >

              {/* CANCEL */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  backgroundColor: theme.background,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "700",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* SAVE */}
              <TouchableOpacity
                onPress={async () => {

                  try {

                    const userRef = doc(
                      db,
                      "users",
                      user.uid
                    );

                    if (fieldTitle === "Name") {

                      await updateDoc(userRef, {
                        name: inputValue,
                      });

                      setUser({
                        ...user,
                        name: inputValue,
                      });
                    }

                    if (fieldTitle === "Phone") {

                      await updateDoc(userRef, {
                        phone: inputValue,
                      });

                      setUser({
                        ...user,
                        phone: inputValue,
                      });
                    }

                    if (fieldTitle === "Email") {

                      await updateDoc(userRef, {
                        email: inputValue,
                      });

                      setUser({
                        ...user,
                        email: inputValue,
                      });
                    }

                    setModalVisible(false);

                    Alert.alert(
                      "Success",
                      `${fieldTitle} updated successfully`
                    );

                  } catch (error) {

                    console.log(error);

                    Alert.alert(
                      "Error",
                      "Update failed"
                    );
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  backgroundColor: theme.primary,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "800",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>








      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

        {/* ACCOUNT */}
        <Section title="ACCOUNT" theme={theme} />
        <Card theme={theme}>
          <Row
            icon="person-outline"
            title="Change Name"
            onPress={() => openEditor("Name")}
            theme={theme}
          />

          <Row
            icon="call-outline"
            title="Phone Number"
            subtitle={`+${callingCode} ${user.phone}`}
            onPress={() => openEditor("Phone")}
            theme={theme}
          />

          <Row
            icon="mail-outline"
            title="Email Address"
            subtitle={user.email}
            onPress={() => openEditor("Email")}
            theme={theme}
          />

        </Card>

        {/* SECURITY */}
        <Section title="SECURITY" theme={theme} />
        <Card theme={theme}>
          <Row
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => navigation.navigate("ForgotPassword")}
            theme={theme}
          />

          <Row
            icon="trash-outline"
            title="Delete Account"
            color="#ef4444"
            rightText=""
            theme={theme}
            onPress={handleDeleteAccount}
          />
        </Card>

        {/* NOTIFICATIONS */}
        <Section title="NOTIFICATIONS" theme={theme} />
        <Card theme={theme}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications-outline" size={20} color={theme.primary} />
              <Text style={{ marginLeft: 12, fontSize: 16, color: theme.text }}>Push Notifications</Text>
            </View>

            <TouchableOpacity
              onPress={() => setNotifications(!notifications)}
              activeOpacity={0.8}
              style={{
                width: 52,
                height: 28,
                borderRadius: 999,
                backgroundColor: notifications ? "#22c55e" : "#d1d5db",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              {/* Circle */}
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "white",
                  alignSelf: notifications ? "flex-end" : "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* PRIVACY */}
        <Section title="PRIVACY" theme={theme} />
        <Card theme={theme}>
          <Row
            icon="refresh-outline"
            title="Clear Search History"
            onPress={handleClearHistory}
            theme={theme}
          />
        </Card>

        {/* PREFERENCES */}
        <Section title="PREFERENCES" theme={theme} />
        <Card theme={theme}>
          <Row
            icon="globe-outline"
            title="App Language"
            rightText="English"
            theme={theme}
          />

          <Row
            icon="hardware-chip-outline"
            title="Default AI Model"
            rightText="Gemini"
            theme={theme}
          />
        </Card>

        {/* LOGOUT */}
        <TouchableOpacity style={{ marginTop: 40, alignItems: 'center' }}>
          <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 16 }}>
            Log Out
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* Section */
const Section = ({ title, theme }) => (
  <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.subText, marginBottom: 8, marginTop: 16 }}>
    {title}
  </Text>
);

/* Card */
const Card = ({ children, theme }) => (
  <View style={{ backgroundColor: theme.card, borderRadius: 16, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
    {children}
  </View>
);

/* Row */
const Row = ({ icon, title, subtitle, rightText, color, onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name={icon} size={20} color={color || theme.primary} />

      <View style={{ marginLeft: 12 }}>
        <Text style={{ color: color || theme.text, fontSize: 16 }}>
          {title}
        </Text>

        {subtitle && (
          <Text style={{ fontSize: 14, color: theme.subText }}>{subtitle}</Text>
        )}
      </View>
    </View>

    {rightText !== undefined ? (
      <Text style={{ color: theme.subText }}>{rightText}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={20} color={theme.subText} />
    )}
  </TouchableOpacity>
);