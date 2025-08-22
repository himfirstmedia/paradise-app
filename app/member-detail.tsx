import { Alert } from "@/components/Alert";
import { PrimaryChoreCard } from "@/components/PrimaryChoreCard";
import { StatusSummaryCard } from "@/components/StatusSummaryCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FloatingButton } from "@/components/ui/FloatingButton";
import { useChoreSummary } from "@/hooks/useChoreSummary";
import { useReduxChores } from "@/hooks/useReduxChores";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { User } from "@/redux/slices/userSlice";
import { House } from "@/types/house";
import api from "@/utils/api";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Alert as Prompt,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

export default function MemberDetailScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  // const inputColor = useThemeColor({}, "input");
  const navigation = useRouter();
  const [alertMessage, setAlertMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { summary, summaryLoading } = useChoreSummary();
  const { houses } = useReduxHouse();
  const { members, reload } = useReduxMembers();

  const {
    chores,
    reload: reloadChores,
    loading: choresLoading,
  } = useReduxChores();

  const userChores = chores.filter((chore) => chore.userId === Number(userId));

  // console.log("Primary Chores:", userChores);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadChores();
    setRefreshing(false);
  };

  if (!userId) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default">Member ID is missing.</ThemedText>
      </ThemedView>
    );
  }

  const member = members.find((m: User) => m.id === Number(userId));

  if (!member) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default">Member not found.</ThemedText>
      </ThemedView>
    );
  }

  const { id, firstname, lastname, name, role, periodStart, periodEnd } =
    member;

  // console.log("Member Detail:", member);

  // Fixed: Simplify house display logic
  const houseDisplayName = member?.houseId
    ? houses.find((h: House) => h.id === member.houseId)?.name ?? "Not Assigned"
    : "Not Assigned";

  const handleDeleteMember = async () => {
    try {
      await api.delete(`/users/${userId}`);
      setAlertMessage(`${name} has been successfully removed`);
      await reload();
      navigation.back();
    } catch {
      setAlertMessage("Failed to delete member. Please try again.");
    } finally {
    }
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 20,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    taskSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
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
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: "30%",
          justifyContent: "flex-start",
        }}
        style={[styles.innerContainer, { backgroundColor: bgColor }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ marginBottom: 20 }}>
          {member.role === "MANAGER" ? "Manager" : "Resident"} Information
        </ThemedText>

        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">First Name:</ThemedText>
          <ThemedText type="default">{firstname}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Last Name:</ThemedText>
          <ThemedText type="default">{lastname}</ThemedText>
        </View>

        <View style={{ marginVertical: 10 }}>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">Period Start:</ThemedText>
            <ThemedText type="default">
              {periodStart ? format(new Date(periodStart), "MM/dd/yyyy") : "—"}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText type="defaultSemiBold">Period End:</ThemedText>
            <ThemedText type="default">
              {periodEnd ? format(new Date(periodEnd), "MM/dd/yyyy") : "—"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">House:</ThemedText>
          <ThemedText type="default">{houseDisplayName}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Role:</ThemedText>
          <ThemedText type="default">{role}</ThemedText>
        </View>

        <View style={{ marginTop: 20, width: "100%" }}>
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
            <>
              {userChores && userChores.length > 0 && (
                <PrimaryChoreCard chores={userChores} />
              )}

              {summaryLoading ? (
                <ActivityIndicator
                  size="large"
                  color={primaryColor}
                  style={{ marginTop: "5%" }}
                />
              ) : !summary ? (
                <StatusSummaryCard
                  summary={{
                    beginningBalance: "0",
                    weekStatus: "0/0",
                    monthStatus: "0/0",
                    periodStatus: "0/0",
                    currentPeriod: "0/0",
                    currentBalance: "0",
                    daysRemaining: 0,
                  }}
                  background="input"
                  textColor={textColor}
                />
              ) : (
                <StatusSummaryCard summary={summary} background="input" textColor={textColor}/>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <FloatingButton
        type="icon-rounded"
        childrenButtons={[
          {
            label: "Delete Member",
            icon: require("@/assets/icons/delete.png"),
            onPress: () => {
              Prompt.alert(
                "Delete Member",
                `Are you sure you want to remove ${name} from the system? This action cannot be undone.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    onPress: handleDeleteMember,
                    style: "destructive",
                  },
                ],
                { cancelable: true }
              );
            },
          },
          {
            label: "Edit Profile",
            icon: require("@/assets/icons/edit-info.png"),
            onPress: () =>
              navigation.push({
                pathname: "/edit-profile",
                params: { id: id },
              }),
          },
          {
            label: "Assign Task",
            icon: require("@/assets/icons/assign.png"),
            onPress: () =>
              navigation.push({
                pathname: "/assign-chore",
                params: {
                  memberName: name,
                },
              }),
          },
        ]}
      />

      {alertMessage && (
        <View>
          <Alert
            type={alertMessage.includes("successfully") ? "success" : "error"}
            message={alertMessage}
          />
        </View>
      )}
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
    paddingVertical: 20,
    width: "100%",
  },
  icon: {
    height: 30,
    width: 30,
  },
});
