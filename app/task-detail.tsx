import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Camera, CameraView } from "expo-camera";

import * as MediaLibrary from "expo-media-library";
// import * as FileSystem from "expo-file-system";

const TASK_STATUS = {
  PENDING: "PENDING",
  REVIEWING: "REVIEWING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export default function TaskDetailScreen() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null); 
  const [cameraReady, setCameraReady] = useState(false);

  const bgColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "selection");
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, reload, loading } = useReduxTasks();
  const task = tasks.find((t) => t.id.toString() === id);

  const { user } = useReduxAuth();
  const role = user?.role;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "You need to grant camera permissions to take pictures."
        );
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();

        await MediaLibrary.saveToLibraryAsync(photo.uri);

        setCapturedImage(photo.uri);

        setCameraVisible(false);
      } catch (error) {
        Alert.alert("Error", "Failed to capture image");
        console.error(error);
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const canDeleteTask = task && role !== "RESIDENT" && role !== "INDIVIDUAL";

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure you want to delete this Task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${id}`);
            await reload();
            Alert.alert("Deleted", "Task deleted successfully.");
            router.back();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to delete task."
            );
          }
        },
      },
    ]);
  };

  // const handleComplete = async () => {
  //   Alert.alert(
  //     "Submit Task",
  //     "Please ensure the task has been completed as per instructions given.",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Confirm",
  //         onPress: async () => {
  //           try {
  //             const formData = new FormData();

  //             if (capturedImage) {
  //               const fileInfo = await FileSystem.getInfoAsync(capturedImage);
  //               formData.append("image", {
  //                 uri: fileInfo.uri,
  //                 name: "task-image.jpg",
  //                 type: "image/jpeg",
  //               } as any);
  //             }

  //             formData.append("status", "REVIEWING");

  //             await api.put(`/tasks/${id}`, formData, {
  //               headers: {
  //                 "Content-Type": "multipart/form-data",
  //               },
  //             });

  //             await reload();
  //             Alert.alert(
  //               "Task Submitted",
  //               "Task marked as completed and is under review."
  //             );
  //             router.back();
  //           } catch (error: any) {
  //             Alert.alert(
  //               "Error",
  //               error?.response?.data?.message ||
  //                 "Failed to update task status."
  //             );
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleApprove = async () => {
    Alert.alert("Approve Task", "Are you sure you want to approve this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await api.put(`/tasks/${id}`, {
              status: "APPROVED",
              progress: "COMPLETED",
            });
            await reload();
            Alert.alert("Success", "Task has been approved.");
            router.back();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to approve task."
            );
          }
        },
      },
    ]);
  };

  const handleReject = async () => {
    Alert.alert("Reject Task", "The resident will be asked to redo the task.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await api.put(`/tasks/${id}`, {
              status: TASK_STATUS.PENDING,
              progress: "PENDING",
            });
            await reload();
            Alert.alert(
              "Task Rejected",
              "Task has been sent back for corrections."
            );
            router.back();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to reject task."
            );
          }
        },
      },
    ]);
  };

  if (loading || !task) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText>Loading Task...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ width: "100%", paddingBottom: "30%" }}
          style={[styles.innerContainer, { backgroundColor: bgColor }]}
        >
          <ThemedText type="title" style={{ marginBottom: "4%" }}>
            {task.name}
          </ThemedText>

          {typeof task.description === "string" &&
            task.description.trim().toLowerCase() !== "null" &&
            task.description.trim().toLowerCase() !== "undefined" &&
            task.description.trim() !== "" && (
              <ThemedView style={styles.column}>
                <ThemedText type="subtitle">Task Description</ThemedText>
                <ThemedText type="default">{task.description}</ThemedText>
              </ThemedView>
            )}

          {typeof task.instruction === "string" &&
            task.instruction.trim().toLowerCase() !== "null" &&
            task.instruction.trim().toLowerCase() !== "undefined" &&
            task.instruction.trim() !== "" && (
              <ThemedView style={styles.column}>
                <ThemedText type="subtitle">Special Instruction</ThemedText>
                <ThemedText type="default">{task.instruction}</ThemedText>
              </ThemedView>
            )}

          {task.image && (
            <ThemedView style={styles.ImageContainer}>
              <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                Image Attachment
              </ThemedText>
              <Image
                source={{
                  uri:
                    process.env.EXPO_PUBLIC_BASE_URL?.replace("/api/v1", "") +
                    task.image,
                }}
                style={{ width: "100%", height: 200, borderRadius: 20 }}
                resizeMode="cover"
              />
            </ThemedView>
          )}

          {capturedImage && (
            <ThemedView style={styles.ImageContainer}>
              <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                Image Attachment
              </ThemedText>
              <Image
                source={{ uri: capturedImage }}
                style={{ width: "100%", height: 200, borderRadius: 20 }}
                resizeMode="cover"
              />
            </ThemedView>
          )}
        </ScrollView>

        <ThemedView style={styles.taskCTAContainer}>
          {/* FACILITY_MANAGER - Delete button for non-REVIEWING tasks */}
          {role === "FACILITY_MANAGER" &&
            task?.status !== TASK_STATUS.REVIEWING && (
              <View style={styles.ctaButtonWrapper}>
                <View
                  style={[styles.ctaRowCentered, { justifyContent: "center" }]}
                >
                  <Button
                    type="icon-rounded"
                    icon={require("@/assets/icons/delete.png")}
                    onPress={handleDelete}
                    iconStyle={styles.icon}
                  />
                </View>
              </View>
            )}

          {/* Submit button for PENDING tasks (non-FACILITY_MANAGER) */}
          {/* {task?.status === TASK_STATUS.PENDING &&
            role !== "FACILITY_MANAGER" &&
            (role === "RESIDENT_MANAGER" ||
              role === "RESIDENT" ||
              role === "INDIVIDUAL") && (
              <View style={styles.ctaButtonWrapper}>
                <View style={styles.ctaRowCentered}>
                  <Button
                    type="default"
                    title="Submit Task"
                    style={{ flex: 1 }}
                    onPress={handleComplete}
                  />
                  <Button
                    type="icon-rounded"
                    icon={require("@/assets/icons/camera.png")}
                    onPress={() => setCameraVisible(true)}
                  />
                </View>
              </View>
            )} */}

          {/* Review buttons for REVIEWING tasks */}
          {task?.status === TASK_STATUS.REVIEWING &&
            (role === "DIRECTOR" ||
              role === "RESIDENT_MANAGER" ||
              role === "FACILITY_MANAGER") && (
              <View style={styles.ctaButtonWrapper}>
                <View style={styles.ctaRowCentered}>
                  <Button
                    type="icon-rounded"
                    icon={require("@/assets/icons/dismiss.png")}
                    onPress={handleReject}
                  />

                  <Button
                    type="default"
                    title="Approve Task"
                    style={{ flex: 1 }}
                    onPress={handleApprove}
                  />
                  {canDeleteTask && (
                    <Button
                      type="icon-rounded"
                      icon={require("@/assets/icons/delete.png")}
                      onPress={handleDelete}
                      iconStyle={styles.icon}
                    />
                  )}
                </View>
              </View>
            )}
        </ThemedView>
      </ThemedView>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          >
            <View
              style={{
                position: "absolute",
                bottom: 40,
                left: 0,
                right: 0,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 30,
              }}
            >
              <Button
                type="icon-rounded"
                icon={require("@/assets/icons/dismiss.png")}
                onPress={() => setCameraVisible(false)}
              />
              <Button
                type="icon-rounded"
                icon={require("@/assets/icons/camera.png")}
                style={{ height: 80, width: 80 }}
                iconStyle={{ height: 40, width: 40 }}
                onPress={takePicture}
              />
              <Button
                type="icon-rounded"
                icon={require("@/assets/icons/camera-flip.png")}
                onPress={toggleCameraFacing}
              />
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
  },
  innerContainer: {
    flexGrow: 1,
    width: "100%",
    padding: 24,
  },
  column: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  taskCTAbtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    height: 35,
    width: 35,
    tintColor: "#FFFFFF",
  },
  taskCTAContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  ctaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  ctaButtonWrapper: {
    position: "absolute",
    flex: 1,
    width: "100%",
    minHeight: 60,
    // borderWidth: 1,
    bottom: "10%",
  },
  deleteBtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ctaRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  ctaButtonFlex: {
    flex: 1,
    alignItems: "center",
  },
  approveBtn: {
    width: "90%",
  },
  iconBtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ImageContainer: {
    flex: 1,
  },
});
