import { Member } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export type AdminRoleType = "RESIDENT_MANAGER" | "FACILITY_MANAGER";

interface AdministratorCardProps {
  members: Member[];
}

// Static labels based on admin role type
const ADMIN_ROLE_LABELS: Record<AdminRoleType, string> = {
  RESIDENT_MANAGER: "Resident Managers",
  FACILITY_MANAGER: "Facility Managers",
};

export function AdministratorCard({ members }: AdministratorCardProps) {
  const bgColor = useThemeColor({}, "input");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const navigation = useRouter();

  // Group admins by role type
  const groupedAdmins: Record<AdminRoleType, Member[]> = {
    RESIDENT_MANAGER: [],
    FACILITY_MANAGER: [],
  };
  members.forEach((member) => {
    if (
      member.role === "RESIDENT_MANAGER" ||
      member.role === "FACILITY_MANAGER"
    ) {
      groupedAdmins[member.role].push(member);
    }
  });

  return (
    <>
      {(Object.keys(groupedAdmins) as AdminRoleType[]).map((role) => {
        const groupAdmins = groupedAdmins[role];
        if (!groupAdmins || groupAdmins.length === 0) return null;
        const showViewAll = groupAdmins.length > 4;
        const isExpanded = expanded[role] || false;
        const displayedAdmins =
          showViewAll && !isExpanded ? groupAdmins.slice(0, 4) : groupAdmins;

        return (
          <ThemedView style={styles.container} key={role}>
            <ThemedView style={[styles.row, { marginBottom: "5%" }]}>
              <ThemedText type="subtitle">{ADMIN_ROLE_LABELS[role]}</ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [role]: !prev[role],
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
              {displayedAdmins.map((admin, idx) => (
                <Pressable
                  key={idx}
                  style={[
                    styles.row,
                    styles.button,
                    { backgroundColor: bgColor },
                  ]}
                  onPress={() =>
                    navigation.push({
                      pathname: "/member-detail",
                      params: {
                        ...admin,
                        house: admin.house ? admin.house.name : null, // Pass house as string or null
                        task: JSON.stringify(admin.task ?? []),
                      },
                    })
                  }
                >
                  <ThemedText type="default">
                    {admin.name}
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
    marginBottom: 20,
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