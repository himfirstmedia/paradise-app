import { AdministratorCard } from "@/components/AdministratorCard";
import { ChoreCard } from "@/components/ChoreCard";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChores } from "@/hooks/useReduxChores";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { User } from "@/redux/slices/userSlice";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

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
  const primaryColor = useThemeColor({}, "selection");
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const { houses } = useReduxHouse();
  const { members, reload } = useReduxMembers();
  const { chores } = useReduxChores();

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  useEffect(() => {
    setCurrentUserRole(user?.role ?? null);
  }, [user]);

  // Find the house by id (params.id comes as string or string[])
  const houseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const house = houses.find(
    (h: { id: any }) => String(h.id) === String(houseId)
  );

  const usersInHouse = members.filter(
    (member: User) => String(member.houseId) === String(houseId)
  );

  const userIdsInHouse = new Set(usersInHouse.map((u: { id: number }) => u.id));

  const houseChores = chores.filter(
    (chore) => chore.userId && userIdsInHouse.has(chore.userId)
  );

  // Filter members for this house
  const houseReduxMembers = members.filter(
    (m: User) => m.house && String(m.house.id) === String(houseId)
  );

  // Split into managers and other members
  const managers = houseReduxMembers.filter((m: User) => m.role === "MANAGER");
  const otherMembers = houseReduxMembers.filter(
    (m: User) => m.role === "RESIDENT"
  );

  if (!house) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">House not found</ThemedText>
      </ThemedView>
    );
  }

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 15,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  const showEditDelete = currentUserRole !== "FACILITY_MANAGER";

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor} // iOS
            colors={[primaryColor]} // Android
          />
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ marginBottom: 10 }}>
          {getFriendlyHouseName(house.name)}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>
          Abbreviation: {house.abbreviation}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 20 }}>
          Residents: {house.users.length} / {house.capacity}
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

        {houseChores.length > 0 ? (
          <ThemedView style={{ marginTop: 20 }}>
            <ChoreCard
              chores={houseChores.map((chore) => ({
                ...chore,
                status: chore.status ?? "PENDING",
              }))}
            />
          </ThemedView>
        ) : (
          <ThemedText type="default" style={{ marginTop: 30 }}>
            No tasks assigned to this house.
          </ThemedText>
        )}
      </ScrollView>

      <FloatingButton
        type="icon-rounded"
        icon={require("@/assets/icons/add.png")}
        childrenButtons={[
          ...(showEditDelete
            ? [
                {
                  label: "Add Member",
                  icon: require("@/assets/icons/profile.png"),
                  onPress: () =>
                    navigation.push({
                      pathname: "/add-member",
                      // params: { id: id },
                    }),
                },
              ]
            : [
                {
                  label: "Add Task",
                  icon: require("@/assets/icons/task.png"),
                  onPress: () =>
                    navigation.push({
                      pathname: "/add-task",
                      params: {
                        // memberName: name,
                      },
                    }),
                },
              ]),
        ]}
      />
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
