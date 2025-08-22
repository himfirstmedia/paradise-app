import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReduxChores } from "@/hooks/useReduxChores";
import type { Chore } from "@/redux/slices/choreSlice";
import { Tooltip } from "./ui/Tooltip";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface ChoreReviewCardProps {
  chores?: Chore[];
  onPress?: (chore: Chore) => void;
}

export function ChoreReviewCard({ chores, onPress }: ChoreReviewCardProps) {
  const router = useRouter();
  const bgColor = useThemeColor({}, "input");

  const { user } = useReduxAuth();
  const { chores: reduxChores, loading, error } = useReduxChores();
  const choresToUse = chores ?? reduxChores;

  // filter chores that need review
  const reviewingChores = choresToUse.filter(
    (chore) =>
      chore.status === "REVIEWING" &&
      chore.houseId === user?.houseId
  );

  const [expanded, setExpanded] = useState(false);

  if (loading && !chores) return <ThemedText>Loading chores...</ThemedText>;
  if (error && !chores) return <ThemedText>Error: {error}</ThemedText>;
  if (reviewingChores.length === 0) return null;
  const showViewAll = reviewingChores.length > 4;
  const displayedChores = expanded
    ? reviewingChores
    : reviewingChores.slice(0, 4);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.row, { marginBottom: 12 }]}>
        <ThemedText type="subtitle">Chores Needing Review</ThemedText>
        {showViewAll && (
          <Pressable onPress={() => setExpanded((prev) => !prev)}>
            <ThemedText type="default">
              {expanded ? "View Less" : "View All"}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>

      <ThemedView style={styles.taskButtons}>
        {displayedChores.map((chore) => (
          <View key={chore.id} style={[styles.row, styles.button, { backgroundColor: bgColor, gap: 10 }]}>
            <Tooltip infoTitle="Chore Details" infoText={chore.description} />
            <Pressable
              style={[styles.row, { flex: 1}]}
              onPress={() => {
                router.push({
                  pathname: "/chore-detail",
                  params: { id: chore.id },
                });
                onPress?.(chore);
              }}
            >
              <ThemedText type="default">{chore.name}</ThemedText>
              <Image
                source={require("../assets/icons/chevron-right.png")}
                style={{ height: 20, width: 20 }}
              />
            </Pressable>
          </View>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: "10%",
    width: "100%",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskButtons: {
    gap: 8,
  },
  button: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
});
