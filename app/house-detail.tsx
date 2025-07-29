import { AdministratorCard } from "@/components/AdministratorCard";
import { MemberCard } from "@/components/MemberCard";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import dayjs from "dayjs";

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
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { houses } = useReduxHouse();
  const { members } = useReduxMembers();
  const { tasks } = useReduxTasks();

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { user } = useReduxAuth();

  useEffect(() => {
    setCurrentUserRole(user?.role ?? null);
  }, [user]);

  // Find the house by id (params.id comes as string or string[])
  const houseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const house = houses.find(
    (h: { id: any }) => String(h.id) === String(houseId)
  );

  const usersInHouse = members.filter(
    (member) => String(member.houseId) === String(houseId)
  );

  const userIdsInHouse = new Set(usersInHouse.map((u) => u.id));

  const houseTasks = tasks.filter(
    (task) => task.userId && userIdsInHouse.has(task.userId)
  );

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

  const startDate = house.workPeriod?.startDate;
  const endDate = house.workPeriod?.endDate;

  let workPeriodRangeInDays: number | null = null;
  if (startDate && endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    workPeriodRangeInDays = end.diff(start, "day") + 1;
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
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <ThemedText type="title" style={{ marginBottom: 10 }}>
          {getFriendlyHouseName(house.name)}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 5 }}>
          Abbreviation: {house.abbreviation}
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 30 }}>
          Capacity: {house.users.length} / {house.capacity} members
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={{ marginBottom: 30 }}>
          Work Period:{" "}
          {workPeriodRangeInDays !== null
            ? `${workPeriodRangeInDays} days (${dayjs(startDate).format("MMM D")} - ${dayjs(endDate).format("MMM D, YYYY")})`
            : "Not set"}
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

        {houseTasks.length > 0 ? (
          <ThemedView style={{ marginTop: 20 }}>
            <TaskCard tasks={houseTasks} />
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
