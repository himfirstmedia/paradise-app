import { User } from '@/redux/slices/userSlice'; // Import User type from slice
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export type RoleType = "RESIDENT" | "INDIVIDUAL";

interface MemberCardProps {
  members: User[]; // Use User interface from slice
}

const ROLE_LABELS: Record<RoleType, string> = {
  RESIDENT: "Residents",
  INDIVIDUAL: "Individuals",
};

function isRoleType(role: string): role is RoleType {
  return role === "RESIDENT" || role === "INDIVIDUAL";
}

export function MemberCard({ members }: MemberCardProps) {
  const bgColor = useThemeColor({}, "input");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const groupedMembers: Record<RoleType, User[]> = {
    RESIDENT: [],
    INDIVIDUAL: [],
  };
  
  members.forEach((member) => {
    if (isRoleType(member.role)) {
      groupedMembers[member.role].push(member);
    }
  });

  return (
    <>
      {(Object.keys(groupedMembers) as RoleType[]).map((role) => {
        const groupMembers = groupedMembers[role];
        if (groupMembers.length === 0) return null;
        
        const showViewAll = groupMembers.length > 4;
        const isExpanded = expanded[role] || false;
        const displayedMembers = showViewAll && !isExpanded 
          ? groupMembers.slice(0, 4) 
          : groupMembers;

        return (
          <ThemedView style={styles.container} key={role}>
            <ThemedView style={[styles.row, { marginBottom: 12 }]}>
              <ThemedText type="subtitle">
                {ROLE_LABELS[role]}
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() => setExpanded(prev => ({
                    ...prev,
                    [role]: !prev[role]
                  }))}
                >
                  <ThemedText type="default">
                    {isExpanded ? "View Less" : "View All"}
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
            <ThemedView style={styles.taskButtons}>
              {displayedMembers.map((member) => (
                <Pressable
                  key={member.id}
                  style={[styles.row, styles.button, { backgroundColor: bgColor }]}
                  onPress={() => router.push({
                    pathname: "/member-detail",
                    params: {
                      id: member.id,
                    }
                  })}
                >
                  <ThemedText type="default">
                    {member.name}
                  </ThemedText>
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
    width: "100%",
    marginBottom: 20
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskButtons: {
    gap: 5,
  },
  button: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
});