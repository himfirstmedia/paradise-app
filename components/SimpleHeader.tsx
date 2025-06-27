import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type SimpleHeaderProps = {
  title?: string;
};

export function SimpleHeader({ title }: SimpleHeaderProps) {
  const navigation = useRouter();
  const bgColor = useThemeColor({}, "selection");

  return (
    <ThemedView>
      <ThemedView
        style={[styles.headerContainer, { backgroundColor: bgColor }]}
      >
        <View style={styles.row}>
          <Pressable onPress={() => navigation.back()}>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              style={styles.backIcon}
            />
          </Pressable>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    paddingTop: "10%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  backIcon: {
    width: 26,
    height: 24,
    tintColor: "#FFFFFF",
  },
  updateIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "left",
  },
  updateButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 30,
    width: "80%",
  },
});
