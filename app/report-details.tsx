import { HalfDonutChart } from "@/components/HalfDonutChart";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
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
import { Task } from "@/redux/slices/taskSlice";
import { TaskCard } from "@/components/TaskCard";
import { User } from "@/redux/slices/userSlice";

function normalizeHouseName(name: string | null): string {
  if (!name) return "INDIVIDUAL";
  return name.trim().replace(/\s+/g, "_").toUpperCase();
}

function getHouseDisplayName(houseValue: string | null): string {
  return houseValue?.trim() || "Individual";
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
  const { filteredMembers, reportTitle, taskStats } = useMemo(() => {
    let filtered: any[] = [];
    let title = "Report";
    let stats = { pending: 0, completed: 0, overdue: 0, totalTasks: 0 };

    // Fallback for direct access
    if (!houseParam && !typeParam && !houseIdParam) {
      return {
        filteredMembers: [],
        reportTitle: "Invalid Report",
        taskStats: stats,
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
    } else if (typeParam === "individuals") {
      title = "Individuals Report";
      filtered = members.filter((member: User) => !member.house);
    }

    // Calculate task stats
    filtered.forEach((member) => {
      member.task?.forEach((task: Task) => {
        if (
          task.progress &&
          ["PENDING", "COMPLETED", "OVERDUE"].includes(task.progress)
        ) {
          stats.totalTasks++;
          switch (task.progress) {
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

    return { filteredMembers: filtered, reportTitle: title, taskStats: stats };
  }, [members, houseParam, typeParam, houseIdParam, houseNameParam]);

  const filteredTasks = useMemo(() => {
  if (!filteredMembers) return [];

  return filteredMembers.reduce((acc, member) => {
    if (member.task && member.task.length > 0) {
      const tasksWithMember = member.task
        .filter((task: Task) => task.progress !== "COMPLETED") // Filter out completed tasks
        .map((task: Task) => ({
          ...task,
          memberName: member.name,
          memberId: member.id,
        }));
      return [...acc, ...tasksWithMember];
    }
    return acc;
  }, [] as Task[]);
}, [filteredMembers]);

  const completionPercent = useMemo(() => {
    return taskStats.totalTasks > 0
      ? Math.round((taskStats.completed / taskStats.totalTasks) * 100)
      : 0;
  }, [taskStats]);

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

        .task-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
          margin-bottom: 20px;
        }

        .task-card {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          width: 220px;
          background-color: #f9f9f9;
          box-sizing: border-box;
        }

        .task-card p {
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
        <p><strong>Pending Tasks:</strong> ${taskStats.pending}</p>
        <p><strong>Completed Tasks:</strong> ${taskStats.completed}</p>
        <p><strong>Overdue Tasks:</strong> ${taskStats.overdue}</p>
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
            member.task?.length
              ? `
              <div class="task-container">
                ${member.task
                  .map(
                    (task: Task) => `
                    <div class="task-card">
                      <p><strong>Task Name:</strong> ${task.name || "N/A"}</p>
                      <p><strong>Description:</strong> ${task.description || ""}</p>
                      <p><strong>Status:</strong> ${task.progress || ""}</p>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            `
              : "<p>No tasks assigned</p>"
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
    taskSection: {
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
            <ThemedText type="defaultSemiBold">Pending Tasks:</ThemedText>
            <ThemedText type="default">{taskStats.pending}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText type="defaultSemiBold">Completed Tasks:</ThemedText>
            <ThemedText type="default">{taskStats.completed}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText type="defaultSemiBold">Overdue Tasks:</ThemedText>
            <ThemedText type="default">{taskStats.overdue}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.chartContainer, { backgroundColor: primaryColor }]}
        >
          <HalfDonutChart
            data={[
              {
                value: taskStats.completed,
                color: completedColor,
                text: "Completed",
              },
              {
                value: taskStats.pending,
                color: pendingColor,
                text: "Pending",
              },
              {
                value: taskStats.overdue,
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
                {taskStats.totalTasks === 0 ? "0%" : `${completionPercent}%`}
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
              <TaskCard tasks={filteredTasks} />
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
