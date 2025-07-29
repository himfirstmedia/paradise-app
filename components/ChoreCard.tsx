import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Tooltip } from "./ui/Tooltip";
import { Chore } from "@/types/chore";

interface ChoreCardProps {
  chore: Chore;
  style?: ViewStyle;
}

export function ChoreCard({ chore, style }: ChoreCardProps) {
  const bgColor = useThemeColor({}, "input");
  const router = useRouter();

  // Handle undefined chore
  if (!chore) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText type="subtitle" style={styles.title}>
          Current Primary Chore
        </ThemedText>
        <View style={[styles.card, { backgroundColor: bgColor }]}>
          <ThemedText type="default">Loading chore...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Safe access with optional chaining
  const userId = chore.currentUser?.id;

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={[styles.row, { gap: 10, marginBottom: 10 }]}>
        <ThemedText type="subtitle" style={styles.title}>
          Current Primary Chore
        </ThemedText>
        <Tooltip
          infoTitle="Chore Details"
          infoText={chore.description ?? "No description available"}
        />
      </View>
      <Pressable
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() => {
          if (!userId) return;
          
          router.push({
            pathname: "/chore-tasks",
            params: {
              chore: chore.id.toString(),
              id: userId.toString(),
            },
          });
        }}
        disabled={!userId}
      >
        <ThemedText type="default">{chore.name}</ThemedText>
        {userId && (
          <Image
            source={require("../assets/icons/chevron-right.png")}
            style={styles.icon}
          />
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  title: {
    // marginBottom: 12,
  },
  card: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    width: 20,
    height: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
