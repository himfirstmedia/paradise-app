import React, { useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

export function Tooltip({
  infoText,
  infoTitle,
}: {
  infoTitle?: string;
  infoText?: string;
}) {
  const [visible, setVisible] = useState(false);

  const bgColor = useThemeColor({}, "input");

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={styles.icon}>
        <Image
          source={require("@/assets/icons/info.png")}
          style={{ height: 25, width: 25 }}
        />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <ThemedView style={[styles.tooltip, { backgroundColor: bgColor }]}>
            <ThemedText type="subtitle">{infoTitle}</ThemedText>
            <ThemedText type="default" style={[styles.tooltipText]}>
              {infoText}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  tooltip: {
    padding: 15,
    borderRadius: 8,
    maxWidth: "80%",

    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipText: {
    fontSize: 14,
    marginTop: 20,
  },
});
