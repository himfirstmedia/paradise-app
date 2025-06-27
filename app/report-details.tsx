import { HalfDonutChart } from "@/components/HalfDonutChart";
import { MemberCard } from "@/components/MemberCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Helper functions for house mapping
function getHouseDisplayName(houseValue: string | null): string {
  if (!houseValue) return "Individual";

  const map: Record<string, string> = {
    LILLIE_LOUISE_WOERMER_HOUSE: "LLW House",
    CAROLYN_ECKMAN_HOUSE: "CE House",
    ADIMINISTRATION: "Administration",
    "LLW House": "LLW House",
    "CE House": "CE House",
    Administration: "Administration",
  };

  return map[houseValue.trim()] || houseValue;
}

function getHouseEnumValue(displayName: string): string {
  const map: Record<string, string> = {
    "LLW House": "LILLIE_LOUISE_WOERMER_HOUSE",
    "CE House": "CAROLYN_ECKMAN_HOUSE",
    Administration: "ADIMINISTRATION",
  };

  return map[displayName.trim()] || displayName;
}

export default function ReportDetails() {
  const { type, house } = useLocalSearchParams();

  const primaryColor = useThemeColor({}, "selection");
  const completedColor = useThemeColor({}, "completed");
  const pendingColor = useThemeColor({}, "pending");
  const overdueColor = useThemeColor({}, "overdue");
  const { loading, members, reload } = useReduxMembers();

  const houseParam = Array.isArray(house) ? house[0] : house;
  const typeParam = Array.isArray(type) ? type[0] : type;

  let houseEnum: string | null = null;
  let filteredMembers = members;
  let reportTitle = "Report";

  if (houseParam) {
    houseEnum = getHouseEnumValue(houseParam);
    filteredMembers = members.filter(
      (m) => m.house && m.house.name === houseEnum
    );
    reportTitle = `${getHouseDisplayName(houseEnum)} Report`;
  } else if (typeParam === "individuals") {
    // Individuals are users without a house
    filteredMembers = members.filter((m) => !m.house);
    reportTitle = "Individuals Report";
  }

  // --- Report title ---

  if (house) {
    reportTitle = `${getHouseDisplayName(houseEnum)} Report`;
  } else if (type) {
    const typeStr = Array.isArray(type) ? type[0] : type;
    reportTitle = `${
      typeStr.charAt(0).toUpperCase() + typeStr.slice(1)
    } Report`;
  }

  // --- Task stats ---
  let pending = 0,
    completed = 0,
    overdue = 0,
    totalTasks = 0;

  filteredMembers.forEach((member) => {
    if (Array.isArray(member.task)) {
      member.task.forEach((task) => {
        if (["PENDING", "COMPLETED", "OVERDUE"].includes(task.progress || "")) {
          totalTasks++;
          switch (task.progress) {
            case "PENDING":
              pending++;
              break;
            case "COMPLETED":
              completed++;
              break;
            case "OVERDUE":
              overdue++;
              break;
          }
        }
      });
    }
  });

  useFocusEffect(
      useCallback(() => {
        reload();
      }, [reload])
    );

  // --- Calculate average completion percentage ---
  let completionPercent = 0;
  if (totalTasks > 0) {
    completionPercent = Math.round((completed / totalTasks) * 100);
  }

  // --- PDF generation ---
  const formatDate = (date = new Date()) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${pad(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`;
  };

  const generatePDF = async () => {
    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${formatDate()}.pdf`;

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
        <p><strong>Pending Tasks:</strong> ${pending}</p>
        <p><strong>Completed Tasks:</strong> ${completed}</p>
        <p><strong>Overdue Tasks:</strong> ${overdue}</p>

        ${filteredMembers
          .map(
            (member) => `
          <h2>${member.name}</h2>
          <p><strong>Phone:</strong> ${member.phone}<br/>
             <strong>Email:</strong> ${member.email}<br/>
             <strong>Team:</strong> ${member.role}<br/>
              <strong>House:</strong> ${
                member.house
                  ? getHouseDisplayName(member.house.name)
                  : "Individual"
              }
             <strong>Start Date:</strong> ${member.joinedDate}<br/>
             <strong>End Date:</strong> ${member.leavingDate ?? ""}</p>
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
      ?.map(
        (task) => `
      <tr>
        <td>${task.name}</td>
        <td>${task.description ?? ""}</td>
        <td>${task.progress ?? ""}</td>
      </tr>
    `
      )
      .join("")}
  </tbody>
          </table>
        `
          )
          .join("")}
      </body>
    </html>
  `;

    const { uri: tempUri } = await Print.printToFileAsync({ html });

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to save the PDF to your device.");
      return;
    }

    const asset = await MediaLibrary.createAssetAsync(tempUri);
    const album = await MediaLibrary.getAlbumAsync("Download");

    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync("Download", asset, false);
    }

    alert(`PDF saved to your Downloads folder as:\n${fileName}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: "30%",
        }}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <ThemedText type="title" style={styles.title}>
          {reportTitle}
        </ThemedText>
        <ThemedView style={styles.row}>
          <ThemedText type="defaultSemiBold">Pending Tasks:</ThemedText>
          <ThemedText type="default">{pending}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText type="defaultSemiBold">Completed Tasks:</ThemedText>
          <ThemedText type="default">{completed}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedText type="defaultSemiBold">Overdue Tasks:</ThemedText>
          <ThemedText type="default">{overdue}</ThemedText>
        </ThemedView>

        <ThemedView
          style={{
            backgroundColor: primaryColor,
            borderRadius: 20,
            marginTop: 15,
            width: "100%",
          }}
        >
          <HalfDonutChart
            data={[
              { value: completed, color: completedColor, text: "Completed" },
              { value: pending, color: pendingColor, text: "Pending" },
              { value: overdue, color: overdueColor, text: "Overdue" },
            ]}
            height={220}
            radius={90}
            innerRadius={60}
            showGradient={false}
            strokeColor={primaryColor}
            strokeWidth={5}
            legendTitle="House Progress"
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
          style={{ marginTop: 20, width: "100%", paddingHorizontal: 5 }}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: "5%" }}
            />
          ) : (
            <MemberCard members={filteredMembers} />
          )}
        </ThemedView>
      </ScrollView>

      <View style={styles.floatingContainer}>
        <ThemedText
          type="default"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 5,
            color: "#fff",
            borderRadius: 5,
            backgroundColor: primaryColor,
          }}
        >
          Download PDF
        </ThemedText>

        <TouchableOpacity
          onPress={generatePDF}
          style={[styles.button, { backgroundColor: primaryColor }]}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/icons/download.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingVertical: 15,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 12,
    width: "60%",
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
  floatingContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 15,
  },
});
