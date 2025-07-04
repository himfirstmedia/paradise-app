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
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";


function getHouseDisplayName(houseValue: string | null): string {
  return houseValue?.trim() || "Individual";
}

export default function ReportDetails() {
  const { type, house } = useLocalSearchParams();
  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");

  const { loading, members } = useReduxMembers();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const houseParam = Array.isArray(house) ? house[0] : house;
  const typeParam = Array.isArray(type) ? type[0] : type;

  // Memoized filtered members and report data
  const { filteredMembers, reportTitle, taskStats } = useMemo(() => {
    let filtered = members;
    let title = "Report";
    let stats = { pending: 0, completed: 0, overdue: 0, totalTasks: 0 };

    if (houseParam) {
      const displayName = getHouseDisplayName(houseParam);
      title = `${displayName} Report`;

      filtered = members.filter((member) => {
        const memberHouse = member.house?.name || "";
        return getHouseDisplayName(memberHouse) === displayName;
      });
    } else if (typeParam === "individuals") {
      title = "Individuals Report";
      filtered = members.filter((member) => !member.house);
    }

    // Calculate task statistics
    filtered.forEach((member) => {
      member.task?.forEach((task) => {
        if (["PENDING", "COMPLETED", "OVERDUE"].includes(task.progress || "")) {
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
  }, [members, houseParam, typeParam]);

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
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 24px; }
              h2 { font-size: 20px; margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>${reportTitle}</h1>
            <p><strong>Pending Tasks:</strong> ${taskStats.pending}</p>
            <p><strong>Completed Tasks:</strong> ${taskStats.completed}</p>
            <p><strong>Overdue Tasks:</strong> ${taskStats.overdue}</p>

            ${filteredMembers
              .map(
                (member) => `
              <h2>${member.name}</h2>
              <p>
                <strong>Phone:</strong> ${member.phone || "N/A"}<br/>
                <strong>Email:</strong> ${member.email || "N/A"}<br/>
                <strong>Team:</strong> ${member.role || "N/A"}<br/>
                <strong>House:</strong> ${member.house ? getHouseDisplayName(member.house.name) : "Individual"}<br/>
                <strong>Start Date:</strong> ${member.joinedDate || "N/A"}<br/>
                <strong>End Date:</strong> ${member.leavingDate || "N/A"}
              </p>
              ${
                member.task?.length
                  ? `
                <table>
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${member.task
                      .map(
                        (task) => `
                      <tr>
                        <td>${task.name || "N/A"}</td>
                        <td>${task.description || ""}</td>
                        <td>${task.progress || ""}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              `
                  : "<p>No tasks assigned</p>"
              }
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
            height={220}
            radius={90}
            innerRadius={60}
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
            <MemberCard members={filteredMembers} />
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
              source={require("@/assets/icons/download.png")}
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
    padding: 16,
  },
  scrollContent: {
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
    paddingHorizontal: 16,
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
  },
  chartCenterText: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  legendContainer: {
    marginTop: 10,
  },
  legendTitle: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
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
    width: 40,
    height: 40,
    tintColor: "#fff",
  },
  floatingContainer: {
    position: "absolute",
    bottom: "5%",
    right: 20,
  },
});
