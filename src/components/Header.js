import React, {
  useContext,
  useState,
  useCallback
} from "react";

import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  useNavigation,
  useFocusEffect
} from "@react-navigation/native";

import { ThemeContext } from "../theme/ThemeContext";
import { UserContext } from "../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(UserContext);

  const [profileImage, setProfileImage] = useState(null);
  
 const darkLogo = require("../../assets/images/full logo.png");
const lightLogo = require("../../assets/images/full logo light.png");





  useFocusEffect(
  useCallback(() => {
    loadProfileImage();
  }, [user])
);

  const loadProfileImage = async () => {
  try {
    if (!user?.uid) return;

    const savedImage = await AsyncStorage.getItem(
      `profileImage_${user.uid}`
    );

    // image ho ya na ho dono case handle
    setProfileImage(savedImage || null);

  } catch (error) {
    console.log(error);
  }
};

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
  {/* LEFT: Logo + Name */}
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Image
  source={theme.background === "#0f172a" ? darkLogo : lightLogo}
  style={{
    width: 110,
    height: 35,
    resizeMode: "contain",
    marginRight: 8,
  }}
/>

</View>


      {/* RIGHT: Profile Image */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        activeOpacity={0.7}
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor:
                theme.background === "#0f172a" ? "#14532d" : "#e8f5ee",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person" size={20} color={theme.primary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}