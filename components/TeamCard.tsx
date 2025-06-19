import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";

export type TeamType = "RESIDENT" | "INDIVIDUAL";

type Team = {
  name: string;
  house: string;
  team: TeamType;
  onPress: () => void;
};

interface TeamCardProps {
  teams: Team[];
}

// Static labels based on team type
const TEAM_LABELS: Record<TeamType, string> = {
  RESIDENT: "Residents",
  INDIVIDUAL: "Individuals",
};

export function TeamCard({ teams }: TeamCardProps) {
  const bgColor = useThemeColor({}, "input");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Group teams by team type
  const groupedTeams: Record<TeamType, Team[]> = {
    RESIDENT: [],
    INDIVIDUAL: [],
  };
  teams.forEach((member) => {
    if (!groupedTeams[member.team]) groupedTeams[member.team] = [];
    groupedTeams[member.team].push(member);
  });

  return (
    <>
      {(Object.keys(groupedTeams) as TeamType[]).map((team) => {
        const groupMembers = groupedTeams[team];
        if (!groupMembers || groupMembers.length === 0) return null;
        const showViewAll = groupMembers.length > 4;
        const isExpanded = expanded[team] || false;
        const displayedMembers =
          showViewAll && !isExpanded ? groupMembers.slice(0, 4) : groupMembers;

        return (
          <ThemedView style={styles.container} key={team}>
            <ThemedView style={[styles.row, { marginBottom: "5%" }]}>
              <ThemedText type="subtitle">
                {TEAM_LABELS[team]}
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [team]: !prev[team],
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
              {displayedMembers.map((member, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.row,
                    styles.button,
                    { backgroundColor: bgColor },
                  ]}
                  onPress={member.onPress}
                >
                  <ThemedText type="default">{member.name}</ThemedText>
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
    minHeight: "20%",
    width: "100%",
    marginBottom: 15,
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