import { Feedback } from "@/redux/slices/feedbackSlice";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";


interface FeedbackCardProps {
  feedbacks: Feedback[];
}

export function FeedbackCard({ feedbacks }: FeedbackCardProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const backBtnColor = useThemeColor({}, "input");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const { members } = useReduxMembers();
  const { tasks } = useReduxTasks();



  const getUserName = (userId: number) =>
    members.find((m) => m.id === userId)?.name ?? `User #${userId}`;

  // Group feedbacks by type
  const groupedFeedbacks: Record<string, Feedback[]> = {
    Comment: [],
    Suggestion: [],
  };
  feedbacks.forEach((fb) => {
    if (fb.type === "Comment") groupedFeedbacks.Comment.push(fb);
    else if (fb.type === "Suggestion") groupedFeedbacks.Suggestion.push(fb);
  });

  return (
    <>
      {(["Comment", "Suggestion"] as const).map((type) => {
        const group = groupedFeedbacks[type];
        if (!group || group.length === 0) return null;
        const showViewAll = group.length > 4;
        const isExpanded = expanded[type] || false;
        const displayed =
          showViewAll && !isExpanded ? group.slice(0, 4) : group;

        return (
          <ThemedView style={styles.container} key={type}>
            <ThemedView style={[styles.row, { marginBottom: 15 }]}>
              <ThemedText type="subtitle">
                {type === "Comment" ? "Comments" : "Suggestions"}
              </ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [type]: !prev[type],
                    }))
                  }
                >
                  <ThemedText type="default">
                    {isExpanded ? "View Less" : "View All"}
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
            <ThemedView style={styles.feedbackList}>
              {displayed.map((fb) => (
                <Pressable
                  key={fb.id}
                  onPress={() => {
                    setSelectedFeedback(fb);
                    setModalVisible(true);
                  }}
                  style={[
                    styles.row,
                    styles.feedbackItem,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      flex: 1,
                    }}
                  >
                    <ThemedText
                      type="subtitle"
                      style={styles.name}
                      numberOfLines={1}
                    >
                      {getUserName(fb.userId)}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={styles.message}
                      numberOfLines={2}
                    >
                      {fb.message}
                    </ThemedText>
                  </View>
                  <Image
                    source={require("../assets/icons/chevron-right.png")}
                    style={{ height: 20, width: 20 }}
                  />
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>
        );
      })}

      {/* Modal for feedback details */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: modalVisible ? backBtnColor : "#FFFFFF" },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Image
                source={require("../assets/icons/dismiss.png")}
                style={{ height: 20, width: 20 }}
              />
            </Pressable>
            <ScrollView contentContainerStyle={styles.modalInnerCard}>
              {selectedFeedback && (
                <>
                  <ThemedText
                    type="title"
                    style={{ color: textColor, marginBottom: 10 }}
                  >
                    {selectedFeedback.type} Details
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    style={{ color: textColor, marginBottom: 6 }}
                  >
                    From: {getUserName(selectedFeedback.userId)}
                  </ThemedText>
                  {selectedFeedback.type === "Comment" &&
                    (() => {
                      const task = tasks.find(
                        (t) => t.id === selectedFeedback.taskId
                      );
                      if (!task) return null;
                      return (
                        <>
                          <ThemedView style={{ flexDirection: "column" }}>
                            <ThemedText
                              type="subtitle"
                              style={{ color: textColor, marginBottom: 5 }}
                            >
                              Commenting On:
                            </ThemedText>
                            <View style={[styles.row, { gap: 8, justifyContent: "flex-start" }]}>
                              <View
                                style={[
                                  styles.dot,
                                  { backgroundColor: textColor },
                                ]}
                              ></View>
                              <ThemedText type="defaultSemiBold">
                                {task.name}
                              </ThemedText>
                            </View>
                          </ThemedView>
                        </>
                      );
                    })()}
                  <View style={{ flexDirection: "column" }}>
                    <ThemedText
                      type="subtitle"
                      style={{ color: textColor, marginBottom: 5 }}
                    >
                      Message:
                    </ThemedText>
                    <ThemedText type="default" style={{ color: textColor }}>
                      {selectedFeedback.message}
                    </ThemedText>
                  </View>
                </>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: "10%",
    width: "100%",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackList: {
    gap: 8,
  },
  feedbackItem: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 6,
    minHeight: 70,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    marginBottom: 2,
    maxWidth: 180,
  },
  message: {
    flex: 1,
    marginRight: 10,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 15,
    height: "100%",
    width: "100%",
    alignItems: "flex-start",
    elevation: 5,
  },
  modalInnerCard: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: "30%",
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
    padding: 8,
    borderRadius: 999,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 999,
  },
});
