import { HalfDonutChart } from "@/components/HalfDonutChart";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/ui/Avatar";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Chore } from "@/types/chore";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  RefreshControl,
} from "react-native";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxHouse } from "@/hooks/useReduxHouse";

export default function TeamsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");
  const navigation = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { members, loading, reload } = useReduxMembers();
  const { houses } = useReduxHouse(); 
  const { user: currentUser } = useReduxAuth();
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  // Get current user's house
  const currentHouse = useMemo(() => {
    if (!currentUser?.houseId) return null;
    return houses.find(house => house.id === currentUser.houseId);
  }, [currentUser, houses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  // Calculate stats only for current user's house
  const houseStats = useMemo(() => {
    if (!currentHouse) {
      return {
        pending: 0,
        completed: 0,
        overdue: 0,
        totalTasks: 0,
        completionPercent: 0,
      };
    }

    const stats = {
      pending: 0,
      completed: 0,
      overdue: 0,
      totalTasks: 0,
      completionPercent: 0,
    };

    members.forEach((member) => {
      // Only process members in the current house
      if (member.house?.id !== currentHouse.id) return;

      member.chore?.forEach((chore: Chore) => {
        if (["PENDING", "APPROVED", "REJECTED"].includes(chore.status || "")) {
          switch (chore.status) {
            case "PENDING":
              stats.pending++;
              break;
            case "APPROVED":
              stats.completed++;
              break;
            case "REJECTED":
              stats.overdue++;
              break;
          }
          stats.totalTasks++;
        }
      });
    });

    stats.completionPercent =
      stats.totalTasks > 0
        ? Math.round((stats.completed / stats.totalTasks) * 100)
        : 0;

    return stats;
  }, [members, currentHouse]);


  const residentsInCurrentHouse = useMemo(() => {
    return members.filter(
      (member) => 
        member.role === "RESIDENT" && 
        member.house?.id === currentHouse?.id
    );
  }, [members, currentHouse]);

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
              tintColor={primaryColor}
              colors={[primaryColor]}
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
                  House
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
              {currentHouse ? (
                <HalfDonutChart
                  data={[
                    {
                      value: houseStats.completed,
                      color: completedColor,
                      text: "Completed",
                    },
                    { 
                      value: houseStats.pending, 
                      color: pendingColor, 
                      text: "Pending" 
                    },
                    { 
                      value: houseStats.overdue, 
                      color: overdueColor, 
                      text: "Overdue" 
                    },
                  ]}
                  height={chartSizes.height}
                  radius={chartSizes.radius}
                  innerRadius={chartSizes.innerRadius}
                  showGradient={false}
                  strokeColor={primaryColor}
                  strokeWidth={5}
                  legendTitle={`${currentHouse.abbreviation} Progress`}
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
                        {houseStats.totalTasks === 0
                          ? "0%"
                          : `${houseStats.completionPercent}%`}
                      </ThemedText>
                    </View>
                  )}
                />
              ) : (
                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                  {currentUser
                    ? "You're not assigned to a house yet."
                    : "Please sign in to view house data"}
                </ThemedText>
              )}
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
            ) : residentsInCurrentHouse.length === 0 ? ( 
              <ThemedText
                type="default"
                style={{
                  textAlign: "center",
                  marginTop: 24,
                  color: "#888",
                }}
              >
                {currentHouse
                  ? "There are no residents in your house yet."
                  : "You're not assigned to a house yet."}
              </ThemedText>
            ) : (
              <>
                <MemberCard members={residentsInCurrentHouse} />
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
    // height: 280,
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
