import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";

export default function Header() {

  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

      {/* 🔹 LEFT: Logo + Name */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, backgroundColor: theme.primary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name="cube-outline" size={20} color="white" />
        </View>

        <Text style={{ color: theme.primary, fontSize: 20, fontWeight: 'bold' }}>
          Kreashiv
        </Text>
      </View>

      {/* 🔹 RIGHT: Profile Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}  // ✅ IMPORTANT
        activeOpacity={0.7}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.background === "#0f172a" ? "#14532d" : "#e8f5ee", alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={20} color={theme.primary} />
        </View>
      </TouchableOpacity>

    </View>
  );
}