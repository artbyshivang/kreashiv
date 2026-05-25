import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";

import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const sections = [
    {
      icon: "person-outline",
      title: "Information We Collect",
      text: "We may collect your email address, profile details, prompt history, subscription information, and app usage data to improve Kreashiv services.",
    },
    {
      icon: "lock-closed-outline",
      title: "Account Information",
      text: "Your account details such as name, email, and profile preferences are securely stored for login and personalization.",
    },
    {
      icon: "document-text-outline",
      title: "Prompt & Content Storage",
      text: "Prompts and generated content may be stored to provide history, personalization, and improve app functionality.",
    },
    {
      icon: "card-outline",
      title: "Subscription & Payments",
      text: "Premium subscriptions are processed securely by trusted payment providers. Kreashiv does not store sensitive card details.",
    },
    {
      icon: "shield-checkmark-outline",
      title: "Security",
      text: "We use industry-standard security practices to protect your data, although no system can guarantee complete security.",
    },
    {
      icon: "trash-outline",
      title: "Account Deletion",
      text: "Users may request account deletion and personal data removal as permitted by law.",
    },
    {
      icon: "mail-outline",
      title: "Contact Us",
      text: "For privacy concerns, contact us at support@kreashiv.cloud",
    },
  ];

  const renderCard = ({ item }) => (
    <View
      style={{
        backgroundColor: theme.card,
        padding: 20,
        borderRadius: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            padding: 10,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <Ionicons
            name={item.icon}
            size={22}
            color={theme.primary}
          />
        </View>

        <Text
          style={{
            color: theme.text,
            fontSize: 17,
            fontWeight: "bold",
          }}
        >
          {item.title}
        </Text>
      </View>

      <Text
        style={{
          color: theme.subText,
          lineHeight: 22,
          fontSize: 14,
        }}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <Header />

      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <>
            {/* TOP */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: theme.primary,
                  marginLeft: 16,
                }}
              >
                Privacy Policy
              </Text>
            </View>

            {/* HERO CARD */}
            <View
              style={{
                backgroundColor: theme.card,
                padding: 24,
                borderRadius: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.background,
                  padding: 16,
                  borderRadius: 50,
                  marginBottom: 14,
                }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={34}
                  color={theme.primary}
                />
              </View>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                Your Privacy Matters
              </Text>

              <Text
                style={{
                  color: theme.subText,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Kreashiv respects your privacy and protects your personal data.
              </Text>
            </View>
          </>
        }
        renderItem={renderCard}
        ListFooterComponent={
          <Text
            style={{
              textAlign: "center",
              color: theme.subText,
              marginTop: 10,
              fontSize: 13,
            }}
          >
            Last Updated: May 2026
          </Text>
        }
      />
    </View>
  );
}