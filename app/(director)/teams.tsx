import { AdministratorCard } from "@/components/AdministratorCard";
import { HalfDonutChart } from "@/components/HalfDonutChart";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Task } from "@/types/task";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

const houses = [
  { label: "LLW House", enum: "LILLIE_LOUISE_WOERMER_HOUSE" },
  { label: "CE House", enum: "CAROLYN_ECKMAN_HOUSE" },
];

export default function TeamsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completed = useThemeColor({}, "completed");
  const pending = useThemeColor({}, "pending");
  const overdue = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { members, loading, reload } = useReduxMembers();
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };


  const houseReduxTaskstats = useMemo(() => {
    const stats: Record<
      string,
      {
        pending: number;
        completed: number;
        overdue: number;
        totalTasks: number;
        completionPercent: number;
      }
    > = {};

    // Initialize stats for all houses
    houses.forEach((house) => {
      stats[house.enum] = {
        pending: 0,
        completed: 0,
        overdue: 0,
        totalTasks: 0,
        completionPercent: 0,
      };
    });

    // Process all members
    members.forEach((member) => {
      // Get the house enum from member's house name
      const houseEnum = member.house?.name
        ? member.house.name.toUpperCase().replace(/ /g, "_")
        : null;

      // Skip if no house or house not in our list
      if (!houseEnum || !stats[houseEnum]) return;

      const houseStat = stats[houseEnum];

      // Process each task for this member
      member.task?.forEach((task: Task) => {
        // Only count tasks with valid progress states
        if (["PENDING", "COMPLETED", "OVERDUE"].includes(task.progress || "")) {
          switch (task.progress) {
            case "PENDING":
              houseStat.pending++;
              break;
            case "COMPLETED":
              houseStat.completed++;
              break;
            case "OVERDUE":
              houseStat.overdue++;
              break;
          }
          houseStat.totalTasks++;
        }
      });
    });

    // Calculate percentages
    Object.values(stats).forEach((stat) => {
      stat.completionPercent =
        stat.totalTasks > 0
          ? Math.round((stat.completed / stat.totalTasks) * 100)
          : 0;
    });

    return stats;
  }, [members]);

  // Helper to get stats for a house
  const getHouseStats = (houseEnum: string) =>
    houseReduxTaskstats[houseEnum] || {
      pending: 0,
      completed: 0,
      overdue: 0,
      totalTasks: 0,
      completionPercent: 0,
    };

  const nonAdminMembers = useMemo(() => {
    return members.filter(
      (member) => member.role !== "SUPER_ADMIN" && member.role !== "DIRECTOR"
    );
  }, [members]);

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: isLargeScreen ? "row" : "row",
      alignItems: isLargeScreen ? "center" : "flex-start",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    chartsWrapper: {
      flexDirection: isLargeScreen ? "row" : "column",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: isLargeScreen ? 50 : 0,
      marginTop: isLargeScreen ? 20 : 5,
      minHeight: isLargeScreen ? "80%" : "40%",
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 15,
    },
    ctaButton: {
      right: isLargeScreen ? "2.5%" : "5%",
      bottom: isLargeScreen ? "10%" : "10%",
    },
  });

  const chartSizes = {
    height: isLargeScreen ? 320 : isMediumScreen ? 220 : 160,
    radius: isLargeScreen ? 150 : isMediumScreen ? 80 : 80,
    innerRadius: isLargeScreen ? 100 : isMediumScreen ? 40 : 50,
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={primaryColor} // iOS
              colors={[primaryColor]} // Android
            />
          }
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "40%",
          }}
          style={styles.innerContainer}
        >
          <ThemedView
            style={[
              styles.headerCard,
              { backgroundColor: primaryColor },
              responsiveStyles.containerPadding,
            ]}
          >
            <ThemedView
              style={[
                styles.row,
                responsiveStyles.headerContainer,
                { backgroundColor: primaryColor },
              ]}
            >
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  Members
                </ThemedText>
              </View>
              <Avatar />
            </ThemedView>

            <ThemedView
              style={[
                styles.column,
                responsiveStyles.chartsWrapper,
                { backgroundColor: primaryColor },
              ]}
            >
              {houses.map((house) => {
                const stats = getHouseStats(house.enum);
                return (
                  <HalfDonutChart
                    key={house.enum}
                    data={[
                      {
                        value: stats.completed,
                        color: completed,
                        text: "Completed",
                      },
                      { value: stats.pending, color: pending, text: "Pending" },
                      { value: stats.overdue, color: overdue, text: "Overdue" },
                    ]}
                    height={chartSizes.height}
                    radius={chartSizes.radius}
                    innerRadius={chartSizes.innerRadius}
                    showGradient={false}
                    strokeColor={primaryColor}
                    strokeWidth={5}
                    legendTitle={`${house.label} Progress`}
                    legendContainerStyle={{ marginTop: 10 }}
                    legendTitleStyle={{ color: "#fff", fontSize: 20 }}
                    legendTextStyle={{ color: "#fff", fontSize: 14 }}
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
                          {stats.totalTasks === 0
                            ? "0%"
                            : `${stats.completionPercent}%`}
                        </ThemedText>
                      </View>
                    )}
                  />
                );
              })}
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[styles.subContainer, responsiveStyles.containerPadding]}
          >
            {loading ? (
              <ActivityIndicator
                size="large"
                color={primaryColor}
                style={{ marginTop: "5%" }}
              />
            ) : nonAdminMembers.length === 0 ? (
              <ThemedText
                type="default"
                style={{
                  textAlign: "center",
                  marginTop: 24,
                  color: "#888",
                }}
              >
                There are no members yet.
              </ThemedText>
            ) : (
              <>
                <AdministratorCard members={members} />
                <MemberCard members={members} />
              </>
            )}
          </ThemedView>
        </ScrollView>

        <Pressable
          style={[
            styles.taskCTAbtn,
            { backgroundColor: primaryColor },
            responsiveStyles.ctaButton,
          ]}
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
    height: 450,
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
  column: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
