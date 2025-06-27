import { Alert } from "@/components/Alert";
import { ProgressType, TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserSessionUtils } from "@/utils/UserSessionUtils";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

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
  const param = useLocalSearchParams();
  const bgColor = useThemeColor({}, "background");
  const navigation = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const { tasks, reload: reloadTasks } = useReduxTasks();

  const {
    id,
    name,
    house,
    role,
    phone,
    email,
    joinedDate,
    leavingDate,
    city,
    state,
    zipCode,
    gender,
    image,
    password,
  } = param;

  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await UserSessionUtils.getUserDetails();
      setCurrentUserRole(user?.role ?? null);
    })();
  }, []);

  const memberId = typeof id === "string" ? Number(id) : id;
  const assignedTasks = tasks.filter((task) => task.userId === memberId);

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

  useEffect(() => {
    console.log("Assigned tasks for member", memberId, assignedTasks);
  }, [memberId, assignedTasks]);

  useFocusEffect(
    useCallback(() => {
      reloadTasks();
    }, [reloadTasks])
  );

  const showEditDelete = currentUserRole !== "FACILITY_MANAGER";

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
            <ThemedText type="default">
              {getFriendlyHouseName(house as string)}
            </ThemedText>
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

        <View style={[styles.row, {gap: 20}]}>
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
        childrenButtons={[
          ...(showEditDelete
            ? [
                {
                  label: "Delete Member",
                  icon: require("@/assets/icons/delete.png"),
                  onPress: () => {
                    setAlertMessage(
                      `You are removing ${name} from the system. This action cannot be undone.`
                    );
                    setShowAlert(true);
                  },
                },
                {
                  label: "Edit Profile",
                  icon: require("@/assets/icons/edit-info.png"),
                  onPress: () =>
                    navigation.push({
                      pathname: "/edit-profile",
                      params: {
                        id,
                        name,
                        house,
                        role,
                        phone,
                        email,
                        joinedDate,
                        leavingDate,
                        city,
                        state,
                        zipCode,
                        gender,
                        image,
                        password,
                      },
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

      {showAlert && <Alert type="error" message={alertMessage} />}
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
    bottom: 10,
    right: 15,
    height: 50,
    width: 50,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
