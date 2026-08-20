import { useContext, useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { updateDoc } from "firebase/firestore";
import CountryPicker from "react-native-country-picker-modal";
import CustomAlert from "../components/CustomAlert";
import { UserContext } from "../context/UserContext";
import { clearHistory } from "../storage/historyStorage";
import { ThemeContext } from "../theme/ThemeContext";
import { registerForPushNotificationsAsync } from "../utils/notifications";

import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";

import auth from "../firebase/auth";

import {
  deleteDoc,
  doc,
  getDoc,
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
  const { user, setUser, logout } = useContext(UserContext);

  const [profileImage, setProfileImage] = useState(null);
  const [deletePasswordModalVisible, setDeletePasswordModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);


const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState("");
const [alertMessage, setAlertMessage] = useState("");

const showAlert = (title, message) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertVisible(true);
};

const [confirmVisible, setConfirmVisible] = useState(false);
const [confirmTitle, setConfirmTitle] = useState("");
const [confirmMessage, setConfirmMessage] = useState("");
const [confirmAction, setConfirmAction] = useState(null);
const [isDanger, setIsDanger] = useState(false);


const showConfirm = (
  title,
  message,
  onConfirm,
  danger = false
) => {
  setConfirmTitle(title);
  setConfirmMessage(message);
  setConfirmAction(() => onConfirm);
  setIsDanger(danger);
  setConfirmVisible(true);
};








  const openEditor = (type) => {
    setFieldTitle(type);

    if (type === "Name") {
      setInputValue(user?.name || user?.displayName || "");
    }

    if (type === "Email") {
      setInputValue(user?.email || "");
    }

    if (type === "Phone") {
      setInputValue(user?.phone || user?.phoneNumber || "");
    }

    setModalVisible(true);
  };

  const handleClearHistory = () => {
  showConfirm(
    "Clear History",
    "Are you sure you want to delete all search history?",
    async () => {
      try {
        await clearHistory(user?.uid);

        setConfirmVisible(false);

        showAlert(
          "Success",
          "History cleared successfully."
        );

      } catch (error) {
        console.log(error);

        setConfirmVisible(false);

        showAlert(
          "Error",
          "Failed to clear history."
        );
      }
    }
  );
};


  const handleDeleteAccount = () => {
    showConfirm(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account permanently?",
      () => {
        setConfirmVisible(false);
        setDeletePassword("");
        setDeletePasswordModalVisible(true);
      },
      true
    );
  };

  const performAccountDeletion = async (password) => {
    setIsDeleting(true);
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setDeletePasswordModalVisible(false);
        setIsDeleting(false);
        showAlert("Error", "No active user session found. Please log in again.");
        return;
      }

      const uid = currentUser.uid;

      /* 1. RE-AUTHENTICATE USER IF PASSWORD PROVIDED */
      if (password && currentUser.email) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      /* 2. DELETE FIRESTORE USER DOCUMENT FIRST */
try {
  await deleteDoc(doc(db, "users", uid));
  console.log("Firestore user document deleted successfully.");
} catch (fsErr) {
  console.log("Firestore deletion error:", fsErr);
  setIsDeleting(false);
  showAlert(
    "Error",
    "Unable to delete your account data. Please try again."
  );
  return;
}

/* 3. DELETE AUTH ACCOUNT */
await deleteUser(currentUser);
console.log("Firebase Authentication account deleted successfully.");

      /* 4. CLEAR LOCAL STORAGE */
      try {
        await clearHistory(uid);
        await AsyncStorage.removeItem(`profileImage_${uid}`);
        await AsyncStorage.removeItem(`APP_FOLDERS_${uid}`);
      } catch (stErr) {
        console.log("Local storage clear error:", stErr);
      }

      setDeletePasswordModalVisible(false);
      setIsDeleting(false);

      /* 5. LOGOUT & RESET USER STATE */
      try {
        await signOut(auth);
      } catch (soErr) {
        console.log("Signout error:", soErr);
      }
      setUser(null);

      showAlert("Success", "Account deleted successfully.");

    } catch (error) {
      console.log("Account deletion error:", error);
      setIsDeleting(false);

      let errorMsg = error.message;

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        errorMsg = "Incorrect password. Please enter your correct account password.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMsg = "Security requirement: Please re-enter your password to confirm account deletion.";
        setDeletePasswordModalVisible(true);
        return;
      }

      showAlert("Error", errorMsg);
    }
  };



const loadProfileImage = async () => {
  try {
    if (!user?.uid) return;

    const savedImage = await AsyncStorage.getItem(
      `profileImage_${user.uid}`
    );

    setProfileImage(savedImage || null);

  } catch (error) {
    console.log(error);
  }
};

const loadNotificationSetting = async () => {
  try {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      setNotifications(
        userData.notificationsEnabled ?? true
      );
    }

  } catch (error) {
    console.log(error);
  }
};







useEffect(() => {
  loadProfileImage();
  loadNotificationSetting();
}, [user]);







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

      
      
       <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
  {profileImage ? (
    <Image
      source={{ uri: profileImage }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
      }}
    />
  ) : (
    <Ionicons
      name="person-circle-outline"
      size={26}
      color={theme.primary}
    />
  )}
</TouchableOpacity> 



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

                    showAlert(
                      "Success",
                      `${fieldTitle} updated successfully`
                    );

                  } catch (error) {

                    console.log(error);

                    showAlert(
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
            subtitle={user?.name || user?.displayName || "Not set"}
            onPress={() => openEditor("Name")}
            theme={theme}
          />

          <Row
            icon="call-outline"
            title="Phone Number"
            subtitle={user?.phone ? `+${callingCode} ${user.phone}` : (user?.phoneNumber ? user.phoneNumber : "Not provided")}
            onPress={() => openEditor("Phone")}
            theme={theme}
          />

          <Row
            icon="mail-outline"
            title="Email Address"
            subtitle={user?.email || "Not provided"}
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
              onPress={async () => {
                const newValue = !notifications;

                try {
                  if (newValue) {
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                      setNotifications(true);
                      await updateDoc(doc(db, "users", user.uid), {
                        notificationsEnabled: true,
                        pushToken: token,
                      });
                      showAlert("Success", "Notifications enabled successfully.");
                    } else {
                      setNotifications(false);
                    }
                  } else {
                    setNotifications(false);
                    await updateDoc(doc(db, "users", user.uid), {
                      notificationsEnabled: false,
                      pushToken: null,
                    });
                    showAlert("Success", "Notifications disabled.");
                  }
                } catch (error) {
                  console.log(error);
                  showAlert("Error", "Failed to update notification settings.");
                }
              }}
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
        <TouchableOpacity
          onPress={async () => {
            try {
              await logout();
            } catch (e) {
              console.log(e);
            }
          }}
          style={{ marginTop: 40, alignItems: 'center' }}
        >
          <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 16 }}>
            Log Out
          </Text>
        </TouchableOpacity>

      </ScrollView>


    {/* NORMAL ALERT */}
    <CustomAlert
      visible={alertVisible}
      title={alertTitle}
      message={alertMessage}
      onClose={() => setAlertVisible(false)}
    />

    {/* CONFIRM ALERT */}
    <CustomAlert
      visible={confirmVisible}
      title={confirmTitle}
      message={confirmMessage}
      onClose={() => setConfirmVisible(false)}
      showCancel={true}
      confirmText={isDanger ? "Delete" : "Confirm"}
      cancelText="Cancel"
      danger={isDanger}
      onConfirm={confirmAction}
    />

    {/* DELETE ACCOUNT PASSWORD CONFIRMATION MODAL */}
    <Modal
      visible={deletePasswordModalVisible}
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
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Confirm Account Deletion
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: theme.subText,
              marginBottom: 16,
            }}
          >
            Please enter your password to permanently delete your account.
          </Text>

          <TextInput
            value={deletePassword}
            onChangeText={setDeletePassword}
            placeholder="Enter your password"
            placeholderTextColor={theme.subText}
            secureTextEntry
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: theme.text,
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              disabled={isDeleting}
              onPress={() => {
                setDeletePasswordModalVisible(false);
                setDeletePassword("");
              }}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: theme.background,
                marginRight: 8,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={isDeleting}
              onPress={() => performAccountDeletion(deletePassword)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: "#ef4444",
                marginLeft: 8,
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

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