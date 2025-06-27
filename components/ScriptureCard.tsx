import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type ScriptureCardProps = {
  verse: string;
  version: string;
  scripture: string;
  book: string;
  imageSource?: any;
  iconSource?: any;
};

export function ScriptureCard({
  verse,
  scripture,
  version,
  book,
  imageSource = require("../assets/icons/sun.png"),
  iconSource = require("../assets/icons/sun.png"),
}: ScriptureCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const textColor = useThemeColor({}, "text");
  const backBtnColor = useThemeColor({}, "input");

  const cardContent = (
    <>
      <View style={styles.row}>
        <Image
          source={iconSource}
          style={{
            width: 40,
            height: 40,
            tintColor: textColor,
          }}
        />

        <View style={{ flexDirection: "column" }}>
          <ThemedText
            type="defaultSemiBold"
            style={{
              opacity: 0.8,
              color: textColor,
            }}
          >
            VERSE OF THE DAY
          </ThemedText>
          <ThemedText
            type="defaultSemiBold"
            style={{
              color: textColor,
            }}
          >
            {book} {verse} {version}
          </ThemedText>
        </View>
      </View>
      {modalVisible ? (
        <ThemedText type="title" style={{ color: textColor }}>
          {scripture}
        </ThemedText>
      ) : (
        <ThemedText
          type="default"
          numberOfLines={2}
          style={{ color: textColor }}
        >
          {scripture}
        </ThemedText>
      )}
    </>
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.card, { borderColor: textColor }]}>
          <View style={styles.innerCard}>{cardContent}</View>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: modalVisible ? backBtnColor : "#FFFFFF" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={require("../assets/icons/dismiss.png")}
                style={{ height: 24, width: 24 }}
              />
            </Pressable>

            <ThemedView style={styles.modalInnerCard}>{cardContent}</ThemedView>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

// Remove the ScriptureCardBoard component and its modal for creating posts

const styles = StyleSheet.create({
  card: {
    minHeight: "20%",
    height: 130,
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
  },
  innerCard: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "column",
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 25,
    height: "100%",
    width: "100%",
    alignItems: "center",
    elevation: 5,
  },
  modalInnerCard: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: "30%",
  },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
    padding: 8,
    borderRadius: 999,
  },
});