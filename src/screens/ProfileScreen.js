import React, { useContext, useEffect, } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";
import { UserContext } from "../context/UserContext";

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import auth from "../firebase/auth";
import CustomAlert from "../components/CustomAlert";

import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ProfileScreen() {



  const navigation = useNavigation();
  const {
    theme,
    themeMode,
    setThemeMode
  } = useContext(ThemeContext);

  const {
    user,
    logout,
  } = useContext(UserContext);
  

const [profileImage, setProfileImage] =
  useState(user?.photoURL || null);

useEffect(() => {

  loadProfileImage();

}, []);

const loadProfileImage = async () => {
  try {
    if (!user?.uid) return;

    const savedImage = await AsyncStorage.getItem(
      `profileImage_${user.uid}`
    );

    if (savedImage) {
      setProfileImage(savedImage);
    }
  } catch (error) {
    console.log(error);
  }
};


const [alertVisible, setAlertVisible] = useState(false);
const [alertTitle, setAlertTitle] = useState("");
const [alertMessage, setAlertMessage] = useState("");

const showAlert = (title, message) => {
  setAlertTitle(title);
  setAlertMessage(message);
  setAlertVisible(true);
};




  const isDark = themeMode === "dark" || (themeMode === "system" && theme.background === "#0f172a");

  const toggleDarkMode = () => {
    setThemeMode(isDark ? "light" : "dark");

  };

  const handleLogout = async () => {

    try {

      showAlert("Success", "Logging Out...");
      await logout();

    } catch (error) {

      console.log(error);

      showAlert("Error", "Logout Failed");
    }
  };


/* remove imagw option */




/*image my upload */

const pickImage = async () => {
  try {
    if (!user?.uid) return;

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showAlert("Permission", "Gallery permission required");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      setProfileImage(imageUri);

      await AsyncStorage.setItem(
        `profileImage_${user.uid}`,
        imageUri
      );

      showAlert("Success", "Profile photo updated");
    }

  } catch (error) {
    console.log(error);
    showAlert("Error", "Image upload failed");
  }
};




const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);


const openImageOptions = () => {
  setPhotoOptionsVisible(true);
};

  const showStats = false;
 const isPremiumUser = user?.premium || false;
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

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary }}>Profile</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

        {/* PROFILE */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
          <View style={{ position: 'relative' }}>

    <TouchableOpacity onPress={openImageOptions} activeOpacity={0.8}>
  <View
    style={{
      padding: 3,
      borderRadius: 52,
      borderWidth: 2,
      borderColor: theme.primary,

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 6,
    }}
  >
    <Image
      source={
        profileImage
          ? { uri: profileImage }
          : require("../../assets/images/default-avatar.png")
      }
      style={{
        width: 96,
        height: 96,
        borderRadius: 48,
      }}
    />
  </View>

  <View
    style={{
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#4ade80",
      padding: 8,
      borderRadius: 16,
    }}
  >
    <Ionicons name="camera" size={16} color="black" />
  </View>
</TouchableOpacity>
            
          </View>

          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary, marginTop: 12 }}>
            {user?.name || "User"}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons
              name={isPremiumUser ? "diamond" : "lock-closed"}
              size={14}
              color={isPremiumUser ? "#16a34a" : "#f59e0b"}
            />

            <Text
              style={{
                color: isPremiumUser ? "#16a34a" : "#f59e0b",
                marginLeft: 4,
                fontWeight: "600",
              }}
            >
              {isPremiumUser ? "PREMIUM" : "FREE PLAN"}
            </Text>
          </View>
        </View>

        {showStats && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>

            <View style={{ flex: 1, marginRight: 8, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
              <Ionicons name="sparkles-outline" size={22} color={theme.primary} />
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8, color: theme.text }}>128</Text>
              <Text style={{ color: theme.subText }}>Prompts</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 8, padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
              <Ionicons name="heart-outline" size={22} color="red" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 8, color: theme.text }}>42</Text>
              <Text style={{ color: theme.subText }}>Favorites</Text>
            </View>

          </View>
        )}

        {/* ACCOUNT */}
        <Section title="ACCOUNT" theme={theme} />
        <Card theme={theme}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
          >
            {renderRow("person-outline", "Edit Profile", null, theme)}
          </TouchableOpacity>
        </Card>

        {/* SUBSCRIPTION */}
        <Section title="SUBSCRIPTION" theme={theme} />

        <View
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Premium")}
          style={{
            backgroundColor: isPremiumUser
              ? theme.primary
              : theme.card,
            borderRadius: 24,
            padding: 18,
            marginBottom: 18,
            borderWidth: 1.5,
            borderColor: isPremiumUser
              ? theme.primary
              : theme.border,
          }}
        >

          {/* TOP */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: isPremiumUser
                    ? "rgba(255,255,255,0.2)"
                    : theme.background,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={isPremiumUser ? "diamond" : "lock-closed"}
                  size={22}
                  color={isPremiumUser ? "#fff" : theme.primary}
                />
              </View>

              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: isPremiumUser
                      ? "#fff"
                      : theme.text,
                  }}
                >
                  {isPremiumUser
                    ? "Monthly Pro"
                    : "Free Plan"}
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    color: isPremiumUser
                      ? "#e2e8f0"
                      : theme.subText,
                  }}
                >
                  {isPremiumUser
                    ? "1,000 Credits / Month"
                    : "15 Prompts / Day"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("ManagePlan")}
              style={{
                padding: 6,
              }}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={isPremiumUser ? "#fff" : theme.subText}
              />
            </TouchableOpacity>
          </View>

          {/* DIVIDER */}
          <View
            style={{
              height: 1,
              backgroundColor: isPremiumUser
                ? "rgba(255,255,255,0.15)"
                : theme.border,
              marginVertical: 16,
            }}
          />

          {/* FEATURES */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >

            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={isPremiumUser ? "#fff" : theme.primary}
              />

              <Text
                style={{
                  marginTop: 6,
                  fontWeight: "700",
                  color: isPremiumUser ? "#fff" : theme.text,
                }}
              >
                HQ AI
              </Text>
            </View>

            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons
                name="flash-outline"
                size={18}
                color={isPremiumUser ? "#fff" : theme.primary}
              />

              <Text
                style={{
                  marginTop: 6,
                  fontWeight: "700",
                  color: isPremiumUser ? "#fff" : theme.text,
                }}
              >
                Fast
              </Text>
            </View>

            <View style={{ alignItems: "center", flex: 1 }}>
              <Ionicons
                name="ban-outline"
                size={18}
                color={isPremiumUser ? "#fff" : theme.primary}
              />

              <Text
                style={{
                  marginTop: 6,
                  fontWeight: "700",
                  color: isPremiumUser ? "#fff" : theme.text,
                }}
              >
                Ad-Free
              </Text>
            </View>
          </View>

          {/* BUTTON */}
          {!isPremiumUser && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate("Premium")}
              style={{
                marginTop: 18,
                backgroundColor: theme.primary,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "800",
                }}
              >
                Upgrade Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
















        {/* PREFERENCES */}
        <Section title="PREFERENCES" theme={theme} />
        <Card theme={theme}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="moon-outline" size={20} color={theme.primary} />
              <Text style={{ marginLeft: 12, fontSize: 16, color: theme.text }}>Dark Mode</Text>
            </View>
            <TouchableOpacity
              onPress={toggleDarkMode}
              activeOpacity={0.8}
              style={{
                width: 52,
                height: 28,
                borderRadius: 999,
                backgroundColor: isDark ? "#22c55e" : "#d1d5db",
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
                  alignSelf: isDark ? "flex-end" : "flex-start",
                }}
              />

              {/* ON/OFF */}
              <Text
                style={{
                  position: "absolute",
                  left: isDark ? 10 : 28,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 9,
                }}
              >
                {isDark ? "ON" : "OFF"}
              </Text>
            </TouchableOpacity>
          </View>

          {renderRow("globe-outline", "Language", "English", theme)}
        </Card>

        {/* SUPPORT */}
        <Section title="SUPPORT" theme={theme} />
        <Card theme={theme}>
      
        <TouchableOpacity
        onPress={() => navigation.navigate("HelpCenter")}
        >
       {renderRow("help-circle-outline", "Help Center", null, theme)}
      </TouchableOpacity>
         
         
         
          <TouchableOpacity
           onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            {renderRow("document-text-outline", "Privacy Policy", null, theme)}
          </TouchableOpacity>
         
         
         
          <TouchableOpacity
          onPress={() => navigation.navigate("Terms")}
          >
          {renderRow("document-outline", "Terms & Conditions", null, theme)}
          </TouchableOpacity>
        </Card>

        {/* LOGOUT */}

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            marginTop: 32,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#ef4444', fontWeight: '600' }}>Log Out</Text>
        </TouchableOpacity>

        <Text style={{ color: theme.subText, fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          App Version 1.0.0
        </Text>





      </ScrollView>

      



  <CustomAlert
  visible={alertVisible}
  title={alertTitle}
  message={alertMessage}
  onClose={() => setAlertVisible(false)}
/>



  <Modal
  transparent
  visible={photoOptionsVisible}
  animationType="fade"
>
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    }}
  >
    <View
      style={{
        width: "100%",
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: theme.text,
          marginBottom: 20,
        }}
      >
        Profile Photo
      </Text>

      <TouchableOpacity
        onPress={() => {
          setPhotoOptionsVisible(false);
          pickImage();
        }}
      >
        <Text
          style={{
            color: theme.primary,
            fontSize: 16,
            marginBottom: 16,
          }}
        >
          Upload New Photo
        </Text>
      </TouchableOpacity>

      {profileImage && (
        <TouchableOpacity
          onPress={() => {
            setPhotoOptionsVisible(false);
            removeImage();
          }}
        >
          <Text
            style={{
              color: "red",
              fontSize: 16,
              marginBottom: 16,
            }}
          >
            Remove Photo
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => setPhotoOptionsVisible(false)}
      >
        <Text
          style={{
            color: theme.subText,
            fontSize: 16,
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
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
const Card = ({ children, border, theme }) => (
  <View
    style={{
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: border ? theme.primary : theme.border
    }}
  >
    {children}
  </View>
);

/* Row */
function renderRow(icon, label, rightText, theme) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={20} color={theme.primary} />
        <Text style={{ marginLeft: 12, fontSize: 16, color: theme.text }}>{label}</Text>
      </View>

      {rightText ? (
        <Text style={{ color: theme.subText }}>{rightText}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={theme.subText} />
      )}
    
    
     
    </View>
  );
}