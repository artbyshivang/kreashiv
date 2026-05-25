import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";

import Header from "../components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../theme/ThemeContext";

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const openMail = () => {
    Linking.openURL("mailto:support@kreashiv.cloud");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      
      {/* Header OUTSIDE padding */}
      <Header />

      {/* Content INSIDE padding */}
      <View style={styles.content}>

        {/* Top */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>

          <Text style={[styles.heading, { color: theme.primary }]}>
            Help Center
          </Text>
        </View>

        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: theme.background },
            ]}
          >
            <Ionicons
              name="mail-open-outline"
              size={34}
              color={theme.primary}
            />
          </View>

          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Need Help?
          </Text>

          <Text style={[styles.heroText, { color: theme.subText }]}>
            If you need support, questions, or assistance, our team is available
            by email.
          </Text>
        </View>

        {/* Contact Card */}
        <View
          style={[
            styles.contactCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.mailRow}>
            <View
              style={[
                styles.smallIcon,
                { backgroundColor: theme.background },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color={theme.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Email Support
              </Text>

              <Text style={[styles.emailText, { color: theme.subText }]}>
                support@kreashiv.cloud
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.primary },
            ]}
            onPress={openMail}
          >
            <Text style={styles.buttonText}>Contact Support</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={[styles.footerText, { color: theme.subText }]}>
          More support options like phone or live chat may be added in future.
        </Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 15,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
  },

  heroCard: {
    padding: 24,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 24,
  },

  iconBox: {
    padding: 16,
    borderRadius: 50,
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },

  heroText: {
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
  },

  contactCard: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
  },

  mailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  smallIcon: {
    padding: 12,
    borderRadius: 14,
    marginRight: 14,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },

  emailText: {
    fontSize: 14,
    marginTop: 4,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  footerText: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 13,
    lineHeight: 20,
  },
});