import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { HalfDonutChart } from "@/components/HalfDonutChart";
import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useReduxAuth } from "@/hooks/useReduxAuth";

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const { loading: tasksLoading, tasks } = useReduxTasks();
  const { user } = useReduxAuth();

  const isFacilityManager = user?.role === "FACILITY_MANAGER";
  const filteredTasks = isFacilityManager
    ? tasks.filter((task) => task.category === "MAINTENANCE")
    : tasks;

  let pending = 0,
    completed = 0,
    overdue = 0,
    totalTasks = filteredTasks.length;

  filteredTasks.forEach((task) => {
    if (task.progress === "PENDING") pending++;
    else if (task.progress === "COMPLETED") completed++;
    else if (task.progress === "OVERDUE") overdue++;
  });

  const completionPercent =
    totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "30%",
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  Tasks
                </ThemedText>
              </View>

              <Avatar />
            </ThemedView>

            <HalfDonutChart
              data={[
                { value: completed, color: completedColor, text: "Completed" },
                { value: pending, color: pendingColor, text: "Pending" },
                { value: overdue, color: overdueColor, text: "Overdue" },
              ]}
              height={220}
              radius={90}
              innerRadius={60}
              showGradient={false}
              strokeColor={primaryColor}
              strokeWidth={5}
              legendTitle="Tasks Progress"
              centerLabelComponent={() => (
                <View>
                  <ThemedText
                    type="title"
                    style={{
                      // fontSize: 22,
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "#FFFFFF",
                    }}
                  >
                    {totalTasks === 0 ? "0%" : `${completionPercent}%`}
                  </ThemedText>
                </View>
              )}
              legendContainerStyle={{ marginTop: 10 }}
              legendTitleStyle={{ color: "#fff", fontSize: 22 }}
              legendTextStyle={{ color: "#fff", fontSize: 14 }}
            />
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <View style={{ marginTop: "1%" }}>
              {tasksLoading ? (
                <ActivityIndicator
                  size="large"
                  color={primaryColor}
                  style={{ marginTop: "5%" }}
                />
              ) : (
                (() => {
                  const isFacilityManager = user?.role === "FACILITY_MANAGER";
                  const visibleTasks = isFacilityManager
                    ? tasks.filter((task) => task.category === "MAINTENANCE")
                    : tasks;

                  return visibleTasks.length === 0 ? (
                    <ThemedText
                      type="default"
                      style={{
                        textAlign: "center",
                        marginTop: 24,
                        color: "#888",
                      }}
                    >
                      There are no tasks to display.
                    </ThemedText>
                  ) : (
                    <TaskCard tasks={visibleTasks} />
                  );
                })()
              )}
            </View>
          </ThemedView>
        </ScrollView>

        <Pressable
          style={[styles.taskCTAbtn, { backgroundColor: primaryColor }]}
          onPress={() => {
            navigation.push("/add-task");
          }}
        >
          <Image
            source={require("@/assets/icons/add.png")}
            style={styles.icon}
          />
        </Pressable>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  subContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  stepContainer: {
    gap: 8,
  },
  headerCard: {
    height: 280,
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chartKey: {
    borderWidth: 1,
    height: "10%",
    width: "100%",
    marginTop: "5%",
  },
  taskCTA: {
    // borderWidth: 1,
  },
  taskCTAbtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "10%",
    right: "5%",
  },
  icon: {
    height: 25,
    width: 25,
    tintColor: "#FFFFFF",
  },
});
