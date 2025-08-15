import React from "react";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Tooltip } from "./ui/Tooltip";
import { Chore } from "@/types/chore";

interface ChoreCardProps {
  chores: Chore[];
  style?: ViewStyle;
}

export function PrimaryChoreCard({ chores, style }: ChoreCardProps) {
  const bgColor = useThemeColor({}, "input");
  const primaryColor = useThemeColor({}, "selection");

  const primaryChores = (chores || []).filter((chore) => chore.isPrimary === true);

  if (primaryChores.length === 0) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText type="subtitle" style={styles.title}>
          Your Current Primary Chore is:
        </ThemedText>
        <View style={[styles.card, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={[styles.row, { gap: 10, marginBottom: 10 }]}>
        {primaryChores.length !== 1 ? (
          <ThemedText type="subtitle" style={styles.title}>
            Your Current Primary Chores are:
          </ThemedText>
        ) : (
          <ThemedText type="subtitle" style={styles.title}>
            Your Current Primary Chore is:
          </ThemedText>
        )}
      </View>
      {primaryChores.map((item) => (
        <View
          key={item.id}
          style={[
            styles.row,
            {
              backgroundColor: bgColor,
              borderRadius: 15,
              paddingHorizontal: 15,
              marginBottom: 8,
            },
          ]}
        >
          <Tooltip
            infoTitle="Chore Details"
            infoText={item.description ?? "No description available"}
          />
          <View style={[styles.card, { flex: 1 }]}>
            <ThemedText type="default">{item.name}</ThemedText>
          </View>
        </View>
      ))}
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
