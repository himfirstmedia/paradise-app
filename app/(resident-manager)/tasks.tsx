import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TaskCard } from "@/components/TaskCard";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { HalfDonutChart } from "@/components/HalfDonutChart";

import type { ProgressType } from "@/components/TaskCard";

const TASKS_DB = [
  {
    name: "Clearing the lawn",
    description: "Remove debris and tidy up the lawn area.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
    progress: "COMPLETED" as ProgressType,
  },
  {
    name: "Trimming hedges",
    description: "Trim the hedges to maintain a neat appearance.",
    progress: "COMPLETED" as ProgressType,
  },
  {
    name: "Weeding flower beds",
    description: "Remove weeds from all flower beds.",
    progress: "PENDING" as ProgressType,
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
    progress: "COMPLETED" as ProgressType,
  },
  {
    name: "Trimming hedges",
    description: "Trim the hedges to maintain a neat appearance.",
    progress: "COMPLETED" as ProgressType,
  },
  {
    name: "Weeding flower beds",
    description: "Remove weeds from all flower beds.",
    progress: "COMPLETED" as ProgressType,
  },
];

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completed = useThemeColor({}, "completed");
  const pending = useThemeColor({}, "pending");
  const overdue = useThemeColor({}, "overdue");
  const navigation = useRouter();

  const tasks = TASKS_DB.map((task) => ({
    ...task,
    onPress: () =>
      navigation.navigate({
        pathname: "/task-detail",
        params: {
          name: task.name,
          description: task.description,
          progress: task.progress,
        },
      }),
  }));

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "80%",
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
                  My Tasks
                </ThemedText>
              </View>

              <Avatar />
            </ThemedView>

            <ThemedView
              style={[styles.chartContainer, { backgroundColor: primaryColor }]}
            >
              <HalfDonutChart
                data={[
                  { value: 47, color: completed, text: "Completed" },
                  { value: 40, color: pending, text: "Pending" },
                  { value: 16, color: overdue, text: "Overdue" },
                ]}
                height={250}
                radius={120}
                innerRadius={70}
                showGradient={false}
                strokeColor={primaryColor}
                strokeWidth={10}
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
                      47%
                    </ThemedText>
                  </View>
                )}
                legendContainerStyle={{ marginTop: 10 }}
                legendTextStyle={{ color: "#fff", fontSize: 14 }}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <TaskCard tasks={tasks} />
          </ThemedView>
        </ScrollView>
        
            <Pressable style={[styles.taskCTAbtn, {backgroundColor: primaryColor}]} onPress={() => {navigation.push("/add-task")}}>
              <Image source={require("@/assets/icons/add.png")} style={styles.icon}/>
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
    height: "50%",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: "5%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartContainer: {
    // borderWidth: 1,
    height: "auto",
    width: "100%",
    marginTop: "15%",
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
    right: "5%"
  },
  icon: {
    height: 25,
    width: 25,
    tintColor: "#FFFFFF"
  }
});
