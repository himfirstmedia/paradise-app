import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type UpdateHeaderProps = {
  title?: string;
  onUpdatePress?: () => void;
};

export function UpdateHeader({ title, onUpdatePress }: UpdateHeaderProps) {
  const navigation = useRouter();
  const bgColor = useThemeColor({}, "selection");

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setRole(user.role);
        }
      } catch (error) {
        console.error("Failed to load user role:", error);
      }
    };

    loadUserRole();
  }, []);

  const canUpdate = [
    "director",
    "facility-manager",
    "resident-manager",
  ].includes(role ?? "");

  return (
    <ThemedView>
      <ThemedView style={[styles.header, { backgroundColor: bgColor }]}>
        <View style={styles.row}>
          <Pressable onPress={() => navigation.back()}>
            <Image
              source={require("@/assets/icons/arrow-left.png")}
              style={styles.backIcon}
            />
          </Pressable>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>

        {canUpdate && (
          <Pressable onPress={onUpdatePress}>
            <Image
              source={require("@/assets/icons/update-task.png")}
              style={styles.updateIcon}
            />
          </Pressable>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    paddingTop: 40,
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 30,
    width: "80%",
  },
});
