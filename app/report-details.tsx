import { ChoreCard } from "@/components/ChoreCard";
import { HalfDonutChart } from "@/components/HalfDonutChart";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Chore } from "@/redux/slices/choreSlice";
import { User } from "@/redux/slices/userSlice";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

function normalizeHouseName(name: string | null): string {
  if (!name) return "RESIDENTS";
  return name.trim().replace(/\s+/g, "_").toUpperCase();
}

function getHouseDisplayName(houseValue: string | null): string {
  return houseValue?.trim() || "Residents";
}

export default function ReportDetails() {
  const { type, house, houseId, houseName } = useLocalSearchParams();
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const { loading, members, reload } = useReduxMembers();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle array parameters
  const houseParam = Array.isArray(house) ? house[0] : house;
  const typeParam = Array.isArray(type) ? type[0] : type;
  const houseIdParam = Array.isArray(houseId) ? houseId[0] : houseId;
  const houseNameParam = Array.isArray(houseName) ? houseName[0] : houseName;

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  // Memoized filtered members and report data
  const { filteredMembers, reportTitle, choreStats } = useMemo(() => {
    let filtered: any[] = [];
    let title = "Report";
    let stats = { pending: 0, completed: 0, overdue: 0, totalChores: 0 };

    // Fallback for direct access
    if (!houseParam && !typeParam && !houseIdParam) {
      return {
        filteredMembers: [],
        reportTitle: "Invalid Report",
        choreStats: stats,
      };
    }

    if (houseIdParam) {
      const id = parseInt(houseIdParam, 10);
      if (!isNaN(id)) {
        title = `${houseNameParam || "House"} Report`;
        filtered = members.filter((member: User) => member.house?.id === id);
      }
    } else if (houseParam) {
      const normalizedParam = normalizeHouseName(houseParam);
      title = `${normalizedParam.replace(/_/g, " ")} Report`;
      filtered = members.filter((member: User) => {
        const memberHouse = member.house?.name || "";
        return normalizeHouseName(memberHouse) === normalizedParam;
      });
    } else if (typeParam === "residents") {
      title = "Residents Report";
      filtered = members.filter((member: User) => !member.house);
    }

    // Calculate chore stats
    filtered.forEach((member) => {
      member.chore?.forEach((chore: Chore) => {
        if (
          chore.progress &&
          ["PENDING", "COMPLETED", "OVERDUE"].includes(chore.progress)
        ) {
          stats.totalChores++;
          switch (chore.progress) {
            case "PENDING":
              stats.pending++;
              break;
            case "COMPLETED":
              stats.completed++;
              break;
            case "OVERDUE":
              stats.overdue++;
              break;
          }
        }
      });
    });

    return { filteredMembers: filtered, reportTitle: title, choreStats: stats };
  }, [members, houseParam, typeParam, houseIdParam, houseNameParam]);

  const filteredChores = useMemo(() => {
  if (!filteredMembers) return [];

  return filteredMembers.reduce((acc, member) => {
    if (member.chore && member.chore.length > 0) {
      const choresWithMember = member.chore
        .filter((chore: Chore) => chore.progress !== "COMPLETED") // Filter out completed chores
        .map((chore: Chore) => ({
          ...chore,
          memberName: member.name,
          memberId: member.id,
        }));
      return [...acc, ...choresWithMember];
    }
    return acc;
  }, [] as Chore[]);
}, [filteredMembers]);

  const completionPercent = useMemo(() => {
    return choreStats.totalChores > 0
      ? Math.round((choreStats.completed / choreStats.totalChores) * 100)
      : 0;
  }, [choreStats]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          font-size: 14px;
          color: #333;
        }

        h1 {
          text-align: center;
          margin-bottom: 30px;
        }

        .member-table {
          margin-bottom: 20px;
        }

        .member-table th,
        .member-table td {
          padding: 8px;
          text-align: left;
        }

        .member-header {
          background-color: #e0e0e0;
          font-weight: bold;
        }

        .chore-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
          margin-bottom: 20px;
        }

        .chore-card {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          width: 220px;
          background-color: #f9f9f9;
          box-sizing: border-box;
        }

        .chore-card p {
          margin: 4px 0;
        }

        .summary {
          margin-bottom: 30px;
        }

        .summary p {
          margin: 6px 0;
        }
      </style>
    </head>
    <body>
      <h1>${reportTitle}</h1>

      <div class="summary">
        <p><strong>Pending Chores:</strong> ${choreStats.pending}</p>
        <p><strong>Completed Chores:</strong> ${choreStats.completed}</p>
        <p><strong>Overdue Chores:</strong> ${choreStats.overdue}</p>
      </div>

      ${filteredMembers
        .map(
          (member) => `
        <div class="member-table">
          <table width="100%" border="1" cellspacing="0" cellpadding="0">
            <tr class="member-header">
              <th colspan="2">${member.name}</th>
            </tr>
            <tr>
              <td width="25%"><strong>Phone</strong></td>
              <td>${member.phone || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Email</strong></td>
              <td>${member.email || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>Team</strong></td>
              <td>${member.role || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>House</strong></td>
              <td>${member.house ? getHouseDisplayName(member.house.name) : "Individual"}</td>
            </tr>
            <tr>
              <td><strong>Start Date</strong></td>
              <td>${member.joinedDate || "N/A"}</td>
            </tr>
            <tr>
              <td><strong>End Date</strong></td>
              <td>${member.leavingDate || "N/A"}</td>
            </tr>
          </table>

          ${
            member.chore?.length
              ? `
              <div class="chore-container">
                ${member.chore
                  .map(
                    (chore: Chore) => `
                    <div class="chore-card">
                      <p><strong>Chore Name:</strong> ${chore.name || "N/A"}</p>
                      <p><strong>Description:</strong> ${chore.description || ""}</p>
                      <p><strong>Status:</strong> ${chore.progress || ""}</p>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `
              : "<p>No chores assigned</p>"
          }
        </div>
      `
        )
        .join("")}
    </body>
  </html>
`;


      const { uri } = await Print.printToFileAsync({ html });

      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing is not available on this device");
        return;
      }

      await Sharing.shareAsync(newPath, {
        mimeType: "application/pdf",
        dialogTitle: "Share or Save PDF",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
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
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 15,
    },
    scriptureSection: {
      marginBottom: isLargeScreen ? 15 : 20,
      marginTop: isLargeScreen ? 10 : 5,
      maxHeight: isLargeScreen ? 200 : 100,
    },
    choreSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  const chartSizes = {
    height: isLargeScreen ? 320 : isMediumScreen ? 220 : 160,
    radius: isLargeScreen ? 150 : isMediumScreen ? 80 : 80,
    innerRadius: isLargeScreen ? 100 : isMediumScreen ? 40 : 50,
  };

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
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === "web" && { minHeight: "100%" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          {reportTitle}
        </ThemedText>

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.statRow}>
            <ThemedText type="defaultSemiBold">Pending Chores:</ThemedText>
            <ThemedText type="default">{choreStats.pending}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText type="defaultSemiBold">Completed Chores:</ThemedText>
            <ThemedText type="default">{choreStats.completed}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText type="defaultSemiBold">Overdue Chores:</ThemedText>
            <ThemedText type="default">{choreStats.overdue}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.chartContainer, { backgroundColor: primaryColor }]}
        >
          <HalfDonutChart
            data={[
              {
                value: choreStats.completed,
                color: completedColor,
                text: "Completed",
              },
              {
                value: choreStats.pending,
                color: pendingColor,
                text: "Pending",
              },
              {
                value: choreStats.overdue,
                color: overdueColor,
                text: "Overdue",
              },
            ]}
            height={chartSizes.height}
            radius={chartSizes.radius}
            innerRadius={chartSizes.innerRadius}
            showGradient={false}
            strokeColor={primaryColor}
            strokeWidth={5}
            legendTitle="House Progress"
            centerLabelComponent={() => (
              <ThemedText type="title" style={styles.chartCenterText}>
                {choreStats.totalChores === 0 ? "0%" : `${completionPercent}%`}
              </ThemedText>
            )}
            legendContainerStyle={styles.legendContainer}
            legendTitleStyle={styles.legendTitle}
            legendTextStyle={styles.legendText}
          />
        </ThemedView>

        <ThemedView style={styles.memberContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={primaryColor} />
          ) : (
            <>
              <MemberCard members={filteredMembers} />
              <ChoreCard chores={filteredChores} />
            </>
          )}
        </ThemedView>
      </ScrollView>

      <View style={styles.floatingContainer}>
        <TouchableOpacity
          onPress={generatePDF}
          style={[styles.button, { backgroundColor: primaryColor }]}
          disabled={isGeneratingPDF}
          activeOpacity={0.7}
        >
          {isGeneratingPDF ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Image
              source={require("@/assets/icons/share-normal.png")}
              style={styles.icon}
            />
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: "100%",
    paddingVertical: "5%",
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statsContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    height: 210,
  },
  chartCenterText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  legendContainer: {
    marginTop: 10,
    marginLeft: 10,
  },
  legendTitle: {
    color: "#fff",
    fontSize: 18,
    textAlign: "left",
  },
  legendText: {
    color: "#fff",
    fontSize: 14,
  },
  memberContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  icon: {
    width: 35,
    height: 35,
    tintColor: "#fff",
  },
  floatingContainer: {
    position: "absolute",
    bottom: "5%",
    right: 20,
  },
});
