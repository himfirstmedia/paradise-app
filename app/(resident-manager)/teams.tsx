import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { TeamCard, TeamType } from "@/components/TeamCard";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";
import { HalfDonutChart } from "@/components/HalfDonutChart";
import { ProgressType } from "@/components/TaskCard";

const TEAM_MEMBERS = [
  {
    id: "1",
    name: "Alice Johnson",
    house: "Lillie Louise Woermer House",
    team: "RESIDENT" as TeamType,
    phone: "555-1234",
    email: "alice.johnson@example.com",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "2",
    name: "Bob Smith",
    house: "Lillie Louise Woermer House",
    team: "RESIDENT" as TeamType,
    phone: "555-5678",
    email: "bob.smith@example.com",
    startDate: "2023-02-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "3",
    name: "Carol Lee",
    house: "Lillie Louise Woermer House",
    team: "RESIDENT" as TeamType,
    phone: "555-8765",
    email: "carol.lee@example.com",
    startDate: "2023-03-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "4",
    name: "David Kim",
    house: "Lillie Louise Woermer House",
    team: "RESIDENT" as TeamType,
    phone: "555-4321",
    email: "david.kim@example.com",
    startDate: "2023-04-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "5",
    name: "Eve Turner",
    house: "Lillie Louise Woermer House",
    team: "RESIDENT" as TeamType,
    phone: "555-2468",
    email: "eve.turner@example.com",
    startDate: "2023-05-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "6",
    name: "Frank Miller",
    house: "Lillie Louise Woermer House",
    team: "INDIVIDUAL" as TeamType,
    phone: "555-1357",
    email: "frank.miller@example.com",
    startDate: "2023-06-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
  {
    id: "7",
    name: "Grace Lee",
    house: "Lillie Louise Woermer House",
    team: "INDIVIDUAL" as TeamType,
    phone: "555-9753",
    email: "grace.lee@example.com",
    startDate: "2023-07-01",
    endDate: "2023-12-31",
    tasks: [
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
    ],
  },
];

export default function TeamsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completed = useThemeColor({}, "completed");
  const pending = useThemeColor({}, "pending");
  const overdue = useThemeColor({}, "overdue");
  const navigation = useRouter();

  const teams = TEAM_MEMBERS.map((member) => ({
    ...member,
    onPress: () =>
      navigation.navigate({
        pathname: "/member-detail",
        params: {
          id: member.id,
          name: member.name,
          house: member.house,
          team: member.team,
          phone: member.phone,
          email: member.email,
          startDate: member.startDate,
          endDate: member.endDate,
          tasks: JSON.stringify(member.tasks),
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
                  My Teams
                </ThemedText>
              </View>
              <Avatar />
            </ThemedView>

            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <ThemedView
                style={[
                  styles.chartContainer,
                  { backgroundColor: primaryColor },
                ]}
              >
                <HalfDonutChart
                  data={[
                    { value: 47, color: completed, text: "Completed" },
                    { value: 40, color: pending, text: "Pending" },
                    { value: 16, color: overdue, text: "Overdue" },
                  ]}
                  height={80}
                  radius={80}
                  innerRadius={50}
                  showGradient={false}
                  strokeColor={primaryColor}
                  strokeWidth={5}
                  centerLabelComponent={() => (
                    <View>
                      <ThemedText
                        type="title"
                        style={{
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#FFFFFF",
                        }}
                      >
                        I
                      </ThemedText>
                    </View>
                  )}
                  legendContainerStyle={{ marginTop: 10 }}
                  legendTextStyle={{ color: "#fff", fontSize: 14 }}
                />
              </ThemedView>
              <ThemedView
                style={[
                  styles.chartContainer,
                  { backgroundColor: primaryColor },
                ]}
              >
                <HalfDonutChart
                  data={[
                    { value: 47, color: completed, text: "Completed" },
                    { value: 40, color: pending, text: "Pending" },
                    { value: 16, color: overdue, text: "Overdue" },
                  ]}
                  height={80}
                  radius={80}
                  innerRadius={50}
                  showGradient={false}
                  strokeColor={primaryColor}
                  strokeWidth={5}
                  centerLabelComponent={() => (
                    <View>
                      <ThemedText
                        type="title"
                        style={{
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#FFFFFF",
                        }}
                      >
                        R
                      </ThemedText>
                    </View>
                  )}
                  legendContainerStyle={{ marginTop: 10 }}
                  legendTextStyle={{ color: "#fff", fontSize: 14 }}
                />
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <TeamCard teams={teams} />
          </ThemedView>
        </ScrollView>

        <Pressable
          style={[styles.taskCTAbtn, { backgroundColor: primaryColor }]}
          onPress={() => {
            navigation.push("/add-member");
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
    height: "auto",
    width: "50%",
    marginTop: "35%",
    // borderWidth: 1
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
