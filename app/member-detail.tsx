import { Alert } from "@/components/Alert";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { AlertDialog } from "@/components/ui/AlertDialog";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";
import { ChoreCard } from "@/components/ChoreCard";
import { useTaskSummary } from "@/hooks/useTaskSummary";
import { useReduxChores } from "@/hooks/useReduxChores";

function getFriendlyHouseName(house?: string | null) {
  if (!house) return "";
  const map: Record<string, string> = {
    LILLIE_LOUISE_WOERMER_HOUSE: "LILLIE LOUISE WOERMER HOUSE",
    CAROLYN_ECKMAN_HOUSE: "CAROLYN ECKMAN HOUSE",
    "LLW House": "LLW House",
    "CE House": "CE House",
    Administration: "Administration",
    ADIMINISTRATION: "Administration",
  };
  return map[house.trim()] || house;
}

export default function MemberDetailScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const bgColor = useThemeColor({}, "background");
  const navigation = useRouter();
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { tasks, reload: reloadTasks, loading: tasksLoading } = useReduxTasks();
  const { summary, summaryLoading } = useTaskSummary();
  const { houses } = useReduxHouse();
  const { members, reload } = useReduxMembers();
  const { user } = useReduxAuth();
  const { chores } = useReduxChores();

  const userTasks = tasks.filter((task) => task.userId === Number(userId));

  const taskWithChore = userTasks.find((task) => task.choreId != null);

  const primaryChore = chores.find(
    (chore) => chore.id === taskWithChore?.choreId
  );

  useEffect(() => {
    setCurrentUserRole(user?.role ?? null);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      reloadTasks();
      reload();
    }, [reloadTasks, reload])
  );

  if (!userId) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default">Member ID is missing.</ThemedText>
      </ThemedView>
    );
  }

  const member = members.find((m) => m.id === Number(userId));

  if (!member) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default">Member not found.</ThemedText>
      </ThemedView>
    );
  }

  const { id, name, houseId, role, phone, email, joinedDate, leavingDate } =
    member;

  // Fixed: Handle all types of house IDs consistently
  const getHouseNameById = (id: number | string | null) => {
    if (id === null || id === undefined) return "";

    // Convert to string for consistent comparison
    const idStr = String(id);
    const foundHouse = houses.find(
      (house) =>
        house.id !== null &&
        house.id !== undefined &&
        String(house.id) === idStr
    );

    return foundHouse ? foundHouse.name : "";
  };

  // Fixed: Simplify house display logic
  const houseDisplayName =
    houseId !== null && houseId !== undefined
      ? getHouseNameById(houseId)
      : getFriendlyHouseName(houseId ? String(houseId) : null);

  const showEditDelete = currentUserRole !== "FACILITY_MANAGER";

  const handleDeleteMember = async () => {
    try {
      await api.delete(`/users/${userId}`);
      setAlertMessage(`${name} has been successfully removed`);
      await reload();
      setTimeout(() => navigation.back(), 1500);
    } catch {
      setAlertMessage("Failed to delete member. Please try again.");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 20,
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

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: "30%",
          justifyContent: "flex-start",
        }}
        style={[styles.innerContainer, { backgroundColor: bgColor }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.row, { marginBottom: 30 }]}>
          <UserAvatar
            size={100}
            user={{ name: Array.isArray(name) ? name[0] : name, image: "" }}
          />
          <View>
            <ThemedText type="title" style={{ marginBottom: "1%" }}>
              {name}
            </ThemedText>

            <ThemedText type="default">{phone}</ThemedText>
            <ThemedText type="default">{email}</ThemedText>
          </View>
        </View>

        {role !== "INDIVIDUAL" && (
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">House:</ThemedText>
            <ThemedText type="default">{houseDisplayName}</ThemedText>
          </View>
        )}
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Member Type:</ThemedText>
          <ThemedText type="default">{role}</ThemedText>
        </View>

        {role === "INDIVIDUAL" && (
          <>
            <View style={styles.row}>
              <ThemedText type="defaultSemiBold">Joined On:</ThemedText>
              <ThemedText type="default">
                {joinedDate
                  ? new Date(joinedDate as string).toLocaleDateString()
                  : ""}
              </ThemedText>
            </View>
            <View style={styles.row}>
              <ThemedText type="defaultSemiBold">Leaving On:</ThemedText>
              <ThemedText type="default">
                {leavingDate
                  ? new Date(leavingDate as string).toLocaleDateString()
                  : ""}
              </ThemedText>
            </View>
          </>
        )}

        <View style={{ marginTop: 20, width: "100%" }}>
          {tasksLoading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: "5%" }}
            />
          ) : tasks.length === 0 ? (
            <ThemedText
              type="default"
              style={{
                textAlign: "center",
                marginTop: 24,
                color: "#888",
              }}
            >
              You have no tasks assigned yet.
            </ThemedText>
          ) : (
            <>
              {primaryChore && <ChoreCard chore={primaryChore} />}

              {summaryLoading ? (
                <ActivityIndicator
                  size="large"
                  color={primaryColor}
                  style={{ marginTop: "5%" }}
                />
              ) : !summary ? (
                <StatusSummaryCard
                  summary={{
                    previousBalance: "0 hrs",
                    weekStatus: "0/0 hrs",
                    monthStatus: "0/0 hrs",
                    currentPeriod: "0/0 hrs",
                    currentBalance: "0 hrs",
                    daysRemaining: "0",
                  }}
                />
              ) : (
                <StatusSummaryCard summary={summary} />
              )}
            </>
          )}
        </View>
      </ScrollView>

      <FloatingButton
        type="icon-rounded"
        childrenButtons={[
          ...(showEditDelete
            ? [
                {
                  label: "Delete Member",
                  icon: require("@/assets/icons/delete.png"),
                  onPress: () => setShowDeleteDialog(true),
                },
                {
                  label: "Edit Profile",
                  icon: require("@/assets/icons/edit-info.png"),
                  onPress: () =>
                    navigation.push({
                      pathname: "/edit-profile",
                      params: { id: id },
                    }),
                },
              ]
            : []),
          {
            label: "Assign Task",
            icon: require("@/assets/icons/assign.png"),
            onPress: () =>
              navigation.push({
                pathname: "/assign-task",
                params: {
                  memberName: name,
                },
              }),
          },
        ]}
      />

      <AlertDialog
        visible={showDeleteDialog}
        title="Delete Member"
        message={`Are you sure you want to remove ${name} from the system? This action cannot be undone.`}
        type="destructive"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteMember}
        confirmText="Delete"
      />

      {alertMessage && (
        <Alert
          type={alertMessage.includes("successfully") ? "success" : "error"}
          message={alertMessage}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
  },
  assignmentItem: {
    marginLeft: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  innerContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    width: "100%",
  },
  icon: {
    height: 30,
    width: 30,
  },
});
