/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { ChoreCard } from "@/components/ChoreCard";
import { HalfDonutChart } from "@/components/HalfDonutChart";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useReduxChores } from "@/hooks/useReduxChores";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const {
    chores,
    loading: choresLoading,
    reload,
  } = useReduxChores({
    onlyCurrentUser: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  let pending = 0,
    approved = 0,
    rejected = 0,
    totalTasks = 0;
  chores.forEach((chore) => {
    totalTasks++;
    if (chore.status === "PENDING") pending++;
    else if (chore.status === "APPROVED") approved++;
    else if (chore.status === "REJECTED") rejected++;
  });

  const completionPercent =
    totalTasks > 0 ? Math.round((approved / totalTasks) * 100) : 0;

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
          }}
          style={styles.innerContainer}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView
            style={[
              styles.headerCard,
              { backgroundColor: primaryColor },
              responsiveStyles.containerPadding,
            ]}
          >
            <ThemedView style={[styles.row, { backgroundColor: primaryColor }]}>
              <View>
                <ThemedText
                  type="title"
                  style={{ width: "100%", color: "#FFFFFF" }}
                >
                  Chores
                </ThemedText>
              </View>

              <Avatar />
            </ThemedView>

            <HalfDonutChart
              data={[
                { value: approved, color: completedColor, text: "Approved" },
                { value: pending, color: pendingColor, text: "Pending" },
                { value: rejected, color: overdueColor, text: "Rejected" },
              ]}
              height={chartSizes.height}
              radius={chartSizes.radius}
              innerRadius={chartSizes.innerRadius}
              showGradient={false}
              strokeColor={primaryColor}
              strokeWidth={5}
              legendTitle="Chores Progress"
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

          <ThemedView
            style={[styles.subContainer, responsiveStyles.containerPadding]}
          >
            {choresLoading ? (
              <ActivityIndicator
                size="large"
                color={primaryColor}
                style={{ marginTop: "5%" }}
              />
            ) : chores.length === 0 ? (
              <ThemedText
                type="default"
                style={{
                  textAlign: "center",
                  marginTop: 24,
                  color: "#888",
                }}
              >
                You have no chores assigned yet.
              </ThemedText>
            ) : (
              <ChoreCard
                  chores={chores.map((chore) => ({
                    ...chore,
                    status: chore.status ?? "PENDING",
                  }))}
                />
            )}
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
  },
  headerCard: {
    width: "100%",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    paddingTop: 20,
    paddingBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartContainer: {
    height: "80%",
    width: "100%",
  },
  chartKey: {
    borderWidth: 1,
    height: "10%",
    width: "100%",
    marginTop: "5%",
  },
});
