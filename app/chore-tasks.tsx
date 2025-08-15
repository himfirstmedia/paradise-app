import { ChoreTaskCard } from "@/components/ChoreTaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChores, useReduxTasks } from "@/hooks/useReduxChores";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function ChoreTasksScreen() {
  const { user } = useReduxAuth();
  const { tasks } = useReduxTasks();
  const { chores } = useReduxChores();
  const { houses } = useReduxHouse();
  const { members } = useReduxMembers();
  const params = useLocalSearchParams();

  console.log("Params: ", params);

  const userIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = userIdParam ? Number(userIdParam) : user?.id;

  const userTask = tasks.find(
    (task) => task.userId === userId && !!task.choreId
  );

  const primaryChore = chores.find((chore) => chore.id === userTask?.choreId);

  const member = members.find((m) => m.id === userId);

  // Determine house to display based on user role
  let memberHouse;
  if (
    (user?.role === "RESIDENT_MANAGER" || user?.role === "FACILITY_MANAGER") &&
    userId !== user?.id
  ) {
    // Manager viewing another user's data
    memberHouse = houses.find(
      (house) =>
        house.id === userTask?.user?.houseId || house.id === member?.houseId
    );
  } else {
    // Owner of data or non-manager, show their own house
    memberHouse = houses.find((house) => house.id === user?.houseId);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        style={styles.scrollView}
      >
        <ThemedText type="title" style={{ marginBottom: 15 }}>
          Record Your Hours
        </ThemedText>
        <ThemedText type="default" style={{ marginBottom: 10 }}>
          {memberHouse?.name ?? "No House Assigned"}
        </ThemedText>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Current Primary Chore:</ThemedText>
          <ThemedText type="default">
            {primaryChore?.name ?? "No Primary Assigned"}
          </ThemedText>
        </View>

        <ThemedView style={styles.taskContainer}>
          <ThemedText type="title" style={{marginBottom: 15}}>Tasks Assigned</ThemedText>
          {tasks
            .filter((task) => task.userId === userId)
            .map((task) => (
              <ChoreTaskCard
                key={task.id}
                choreTask={task}
                currentUserRole={user?.role}
              />
            ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  taskContainer: {
    width: "100%",
    marginTop: 20,
  },
});
