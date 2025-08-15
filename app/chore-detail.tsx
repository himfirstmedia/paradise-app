import { TaskCard } from "@/components/ChoreCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxChores, useReduxTasks } from "@/hooks/useReduxChores";
import { Chore } from "@/types/chore";
import { Task } from "@/types/task";
import { useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, StyleSheet } from "react-native";

export default function ChoreDetailScreen() {
  const { id } = useLocalSearchParams();

  const { chores } = useReduxChores();
  const { tasks } = useReduxTasks();

  const chore = chores.find((c: Chore) => c.id === Number(id));
  const relatedTasks = tasks.filter((t: Task) => Number(t.choreId) === chore?.id);

  console.log("Chore Details: ", chore);

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === "web" && { minHeight: "100%" },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="title" style={{ marginBottom: 20 }}>
            Primary Chore Details
          </ThemedText>

          {chore ? (
            <>
              <ThemedView style={[styles.row, { gap: 10 }]}>
                <ThemedText type="defaultSemiBold">Name:</ThemedText>
                <ThemedText>{chore.name}</ThemedText>
              </ThemedView>

              {chore.house && (
                <ThemedView style={[styles.row, { gap: 10 }]}>
                  <ThemedText type="defaultSemiBold">House:</ThemedText>
                  <ThemedText>{chore.house.name}</ThemedText>
                </ThemedView>
              )}

              {chore.description && (
                <>
                  <ThemedView style={{ marginTop: 20 }}>
                    <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
                      Description:
                    </ThemedText>
                    <ThemedText>{chore.description}</ThemedText>
                  </ThemedView>
                </>
              )}

              <ThemedText
                style={{ marginTop: 5, marginBottom: 20 }}
                type="title"
              >
                Tasks Under This Chore
              </ThemedText>

              {relatedTasks.length > 0 ? (
                <TaskCard tasks={relatedTasks} />
              ) : (
                <ThemedText>No tasks found for this chore.</ThemedText>
              )}
            </>
          ) : (
            <ThemedText>Chore not found.</ThemedText>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
