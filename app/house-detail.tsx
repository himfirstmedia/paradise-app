import { AdministratorCard } from "@/components/AdministratorCard";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

// Helper to format house names
function getFriendlyHouseName(name: string) {
  const map: Record<string, string> = {
    LILLIE_LOUISE_WOERMER_HOUSE: "Lillie Louise Woermer House",
    CAROLYN_ECKMAN_HOUSE: "Carolyn Eckman House",
    "LLW House": "LLW House",
    "CE House": "CE House",
    Administration: "Administration",
    ADIMINISTRATION: "Administration",
  };
  return map[name.trim()] || name;
}

export default function HouseDetailScreen() {
  const params = useLocalSearchParams();
  const { houses } = useReduxHouse();
  const { members } = useReduxMembers();

  // Find the house by id (params.id comes as string or string[])
  const houseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const house = houses.find((h: { id: any; }) => String(h.id) === String(houseId));

  // Filter members for this house
  const houseReduxMembers = members.filter(
    (m) => m.house && String(m.house.id) === String(houseId)
  );

  // Split into managers and other members
  const managers = houseReduxMembers.filter(
    (m) => m.role === "RESIDENT_MANAGER" || m.role === "FACILITY_MANAGER"
  );
  const otherMembers = houseReduxMembers.filter(
    (m) => m.role === "RESIDENT" || m.role === "INDIVIDUAL"
  );

  if (!house) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">House not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <ThemedText type="title" style={{ marginBottom: 10 }}>
          {getFriendlyHouseName(house.name)}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>
          Capacity: {house.users.length} / {house.capacity}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={{ marginBottom: 15 }}>
          Abbreviation: {house.abbreviation}
        </ThemedText>

        {managers.length > 0 && (
          <>
            <AdministratorCard members={managers} />
          </>
        )}

        {otherMembers.length > 0 && (
          <>
            <MemberCard members={otherMembers} />
          </>
        )}

        {managers.length === 0 && otherMembers.length === 0 && (
          <ThemedText type="default" style={{ marginTop: 20 }}>
            No members assigned to this house.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});