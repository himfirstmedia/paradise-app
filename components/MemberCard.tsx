import { User } from '@/redux/slices/userSlice'; // Import User type from slice
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface MemberCardProps {
  members: User[]; // Use User interface from slice
}

export function MemberCard({ members }: MemberCardProps) {
  const bgColor = useThemeColor({}, "input");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Group residents by house name
  const groupedByHouse: Record<string, User[]> = {};
  
  members.forEach((member) => {
    if (member.role !== "RESIDENT") return;
    
    const houseName = member.house?.abbreviation || "Individual";
    if (!groupedByHouse[houseName]) {
      groupedByHouse[houseName] = [];
    }
    groupedByHouse[houseName].push(member);
  });

  return (
    <>
      {Object.keys(groupedByHouse).map((houseName) => {
        const groupMembers = groupedByHouse[houseName];
        if (groupMembers.length === 0) return null;
        
        const showViewAll = groupMembers.length > 4;
        const isExpanded = expanded[houseName] || false;
        const displayedMembers = showViewAll && !isExpanded 
          ? groupMembers.slice(0, 4) 
          : groupMembers;

        return (
          <ThemedView style={styles.container} key={houseName}>
            <ThemedView style={[styles.row, { marginBottom: 12 }]}>
              <ThemedText type="subtitle">
                {houseName} Residents
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() => setExpanded(prev => ({
                    ...prev,
                    [houseName]: !prev[houseName]
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