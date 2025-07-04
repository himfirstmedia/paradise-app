import { Alert } from "@/components/Alert";
import { TaskCard } from "@/components/TaskCard";
import type { ProgressType } from "@/redux/slices/taskSlice";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { AlertDialog } from "@/components/ui/AlertDialog";
import api from "@/utils/api";
import { useReduxAuth } from "@/hooks/useReduxAuth";

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
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const bgColor = useThemeColor({}, "background");
  const navigation = useRouter();
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const { tasks, reload: reloadTasks } = useReduxTasks();
  const { houses } = useReduxHouse();
  const { members, reload } = useReduxMembers();
  const { user } = useReduxAuth();

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

  const {
    id,
    name,
    houseId,
    role,
    phone,
    email,
    joinedDate,
    leavingDate,
    city,
    state,
    zipCode,
    gender,
  } = member;

  // Fixed: Convert task.userId to string for consistent comparison
  const assignedTasks = tasks.filter(
    (task) =>
      task.userId !== null &&
      task.userId !== undefined &&
      String(task.userId) === userId
  );

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

  const assignmentsWithOnPress = assignedTasks.map((assignment) => ({
    ...assignment,
    description: assignment.description ?? "",
    progress: assignment.progress as ProgressType,
    onPress: () =>
      navigation.navigate({
        pathname: "/task-detail",
        params: {
          name: assignment.name,
          description: assignment.description,
          progress: assignment.progress,
          instruction: assignment.instruction,
        },
      }),
  }));

  return (
    <ThemedView style={styles.container}>
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
        <View style={[styles.row, { marginBottom: "5%" }]}>
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
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Gender:</ThemedText>
          <ThemedText type="default">{gender}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Zip Code:</ThemedText>
          <ThemedText type="default">{zipCode}</ThemedText>
        </View>

        <View style={[styles.row, { gap: 20 }]}>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">City:</ThemedText>
            <ThemedText type="default">{city}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">State:</ThemedText>
            <ThemedText type="default">{state}</ThemedText>
          </View>
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

        {assignmentsWithOnPress.length === 0 ? (
          <ThemedText type="default" style={{ marginTop: "5%" }}>
            No assignments found.
          </ThemedText>
        ) : (
          <View style={{ marginTop: "5%", width: "100%" }}>
            <TaskCard tasks={assignmentsWithOnPress} />
          </View>
        )}
      </ScrollView>

      <FloatingButton
        type="icon-rounded"
        style={styles.floatingBtn}
        childrenButtons={[
          ...(showEditDelete
            ? [
                {
                  label: "Delete Member",
                  icon: require("@/assets/icons/delete.png"),
                  onPress: () => setShowDeleteDialog(true),
                },
                // FloatingButton changes
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

      {/* Alert Dialog for delete confirmation */}
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
    paddingVertical: "8%",
    width: "100%",
  },
  icon: {
    height: 30,
    width: 30,
  },
  floatingBtn: {
    position: "absolute",
    bottom: "10%",
    right: "5%",
    height: 50,
    width: 50,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
