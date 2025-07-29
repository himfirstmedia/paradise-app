import React, { useState } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReduxChores } from "@/hooks/useReduxChores"; 
import type { Chore } from "@/redux/slices/choreSlice"; 

interface ChoreCardProps {
  chores?: Chore[];
  style?: ViewStyle;
  onPress?: (chore: Chore) => void;
}

export function PrimaryChoresCard({ chores, onPress }: ChoreCardProps) {
  const router = useRouter();
  const bgColor = useThemeColor({}, "input");

  const { chores: reduxChores, loading, error } = useReduxChores();
  const choresToUse = chores ?? reduxChores;

  

  const showLoading = chores ? false : loading;
  const showError = chores ? null : error;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (showLoading) return <ThemedText>Loading chores...</ThemedText>;
  if (showError) return <ThemedText>Error: {showError}</ThemedText>;

  
  const groupedChores: Record<string, Chore[]> = {};

  choresToUse.forEach((chore) => {
    const houseLabel = chore.house?.abbreviation ?? "Unassigned";
    if (!groupedChores[houseLabel]) groupedChores[houseLabel] = [];
    groupedChores[houseLabel].push(chore);
  });

  return (
    <>
      {Object.keys(groupedChores).map((houseName) => {
        const houseChores = groupedChores[houseName];
        const isExpanded = expanded[houseName] || false;
        const showViewAll = houseChores.length > 4;
        const displayedChores = isExpanded ? houseChores : houseChores.slice(0, 4);

        return (
          <ThemedView style={styles.container} key={houseName}>
            <ThemedView style={[styles.row, { marginBottom: 12 }]}>
              <ThemedText type="subtitle">{houseName} Chores</ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [houseName]: !prev[houseName],
                    }))
                  }
                >
                  <ThemedText type="default">
                    {isExpanded ? "View Less" : "View All"}
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
            <ThemedView style={styles.taskButtons}>
              {displayedChores.map((chore) => (
                <Pressable
                  key={chore.id}
                  style={[styles.row, styles.button, { backgroundColor: bgColor }]}
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
              ))}
            </ThemedView>
          </ThemedView>
        );
      })}
    </>
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
