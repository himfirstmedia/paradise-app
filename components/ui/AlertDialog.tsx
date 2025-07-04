// src/components/ui/AlertDialog.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button"; // Import the updated Button
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type AlertDialogProps = {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  style?: StyleProp<ViewStyle>;

  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "default" | "destructive";
};

export function AlertDialog({
  visible,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "default",
}: AlertDialogProps) {
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");

  const confirmButtonColor = type === "destructive" ? "#dc2626" : "#2563eb";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <ThemedView
          style={[
            styles.dialogContainer,
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>

          <ThemedText style={[styles.message, { color: textColor }]}>
            {message}
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Button
              title={cancelText}
              onPress={onCancel}
              style={[styles.button, { backgroundColor: bgColor }]}
              textStyle={{ color: textColor }}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              style={[styles.button, { backgroundColor: confirmButtonColor }]}
              textStyle={styles.confirmText}
            />
          </View>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  dialogContainer: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    width: 100,
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
  },
});
