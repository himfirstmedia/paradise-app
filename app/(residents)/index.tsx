import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ScriptureCard } from "@/components/ScriptureCard";
import { TaskCard } from "@/components/TaskCard";
import { useRouter } from "expo-router";
import { Avatar } from "@/components/ui/Avatar";
import { ThemedText } from "@/components/ThemedText";

const TASKS_DB = [
  {
    name: "Clearing the lawn",
    description: "Remove debris and tidy up the lawn area.",
  },
  {
    name: "Watering plants",
    description: "Ensure all plants are watered thoroughly.",
  },
  {
    name: "Trimming hedges",
    description: "Trim the hedges to maintain a neat appearance.",
  },
  {
    name: "Weeding flower beds",
    description: "Remove weeds from all flower beds.",
  },
  {
    name: "Sweeping pathways",
    description: "Sweep all garden paths and walkways.",
  },
  {
    name: "Fertilizing soil",
    description: "Apply fertilizer to the garden soil as needed.",
  },
  {
    name: "Pruning trees",
    description: "Prune overgrown branches from trees.",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

export default function HomeScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const navigation = useRouter();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user?.name || "User");
        }
      } catch {
        setUserName("User");
      }
    };
    fetchUser();
  }, []);

  const tasks = TASKS_DB.map((task) => ({
    ...task,
    onPress: () =>
      navigation.navigate({
        pathname: "/task-detail",
        params: { name: task.name, description: task.description },
      }),
  }));

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            flex: 1,
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[styles.headerCard, { backgroundColor: primaryColor }]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <ThemedView style={[{ backgroundColor: primaryColor }]}>
                <ThemedText type="subtitle" style={{ fontWeight: 600, color: "#FFFFFF" }}>
                  {getGreeting()}
                </ThemedText>
                <ThemedText type="subtitle" style={{ fontWeight: 600, color: "#FFFFFF" }}>
                  {userName}
                </ThemedText>
              </ThemedView>
              <Avatar />
            </ThemedView>

            <View style={{marginTop: "8%", gap: 12}}>
              <ThemedText type="title" style={{ width: "60%", color: "#FFFFFF" }}>
                Lillie Louise Woermer House
              </ThemedText>
              <ThemedText type="default" numberOfLines={3}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto quibusdam neque illum doloribus ut soluta inventore hic dolorem, quia pariatur sequi quis magnam harum nulla quo nam, incidunt consequuntur repellat!
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.subContainer}>
            <ScriptureCard
              verse="Proverbs 29:25"
              version="NLT"
              content="Fearing people is a dangerous trap, but trusting the LORD means safety."
            />

            <TaskCard label="Pending Tasks" tasks={tasks} />
          </ThemedView>
        </ScrollView>
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
    marginBottom: 8,
  },
  headerCard: {
    height: "50%",
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
