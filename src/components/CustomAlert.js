import React, { useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { ThemeContext } from "../theme/ThemeContext";

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,

  // NEW
  showCancel = false,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  danger = false,
}) {
  const { theme } = useContext(ThemeContext);

  return (
    <Modal
      transparent
      visible={visible}
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
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: theme.text,
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.subText,
              marginBottom: 24,
            }}
          >
            {message}
          </Text>

          {/* TWO BUTTON MODE */}
          {showCancel ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  flex: 1,
                  backgroundColor: danger ? "#ef4444" : theme.primary,
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SINGLE BUTTON MODE */
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: theme.primary,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}