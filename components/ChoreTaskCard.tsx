/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  ThemedCheckbox,
  ThemedDatePicker,
  ThemedTextArea,
  ThemedTimePicker,
} from "./ThemedInput";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";
import { CameraView } from "expo-camera";

import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import api from "@/utils/api";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { Task } from "@/types/task";

interface ChoreCardProps {
  choreTask: Task;
  style?: ViewStyle;
  currentUserRole?: string;
}

export function ChoreTaskCard({
  choreTask,
  style,
  currentUserRole,
}: ChoreCardProps) {
  const bgColor = useThemeColor({}, "input");
  const checkbgColor = useThemeColor({}, "background");
  const [checked, setChecked] = useState(false);
  const [loading, SetLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const { tasks, reload } = useReduxTasks();

  const [errors, setErrors] = useState({
    date: "",
    time: "",
    message: "",
  });

  useEffect(() => {
    const allFilled =
      date.trim() !== "" && time.trim() !== "" && message.trim() !== "";
    setChecked(allFilled);
  }, [date, time, message]);

  useEffect(() => {
    if (choreTask.choreId) {
      setChecked(true);
    }
  }, [choreTask.choreId]);

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

  const handleTaskSubmit = async () => {
    const newErrors = {
      date: date.trim() === "" ? "Date is required" : "",
      time: time.trim() === "" ? "Time is required" : "",
      message: message.trim() === "" ? "Message is required" : "",
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) return;

    try {
      SetLoading(true);
      console.log("Task submitted", { date, time, message });

      const formData = new FormData();

      if (capturedImage) {
        const fileInfo = await FileSystem.getInfoAsync(capturedImage);
        formData.append("image", {
          uri: fileInfo.uri,
          name: "task-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      formData.append("status", "REVIEWING");

      await api.put(`/tasks/${choreTask.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await reload();
      Alert.alert(
        "Task Submitted",
        "Task marked as completed and is under review."
      );
    } catch (error: any) {
      console.log("Task submission failure", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update task status."
      );
    } finally {
      SetLoading(false);
    }
  };

  const isManagerView =
    currentUserRole === "DIRECTOR" ||
    currentUserRole === "FACILITY_MANAGER" ||
    currentUserRole === "RESIDENT_MANAGER";

  return (
    <>
      <ThemedView
        style={[styles.container, style, { backgroundColor: bgColor }]}
      >
        <ThemedView style={[styles.card, { backgroundColor: bgColor }]}>
          <View style={[styles.card, { width: "100%" }]}>
            <View style={[styles.row, { marginRight: "5%" }]}>
              <Tooltip
                infoTitle="Task Details"
                infoText={choreTask.description}
              />

              <Pressable
                onPress={() => {
                  setShowMore((prev) => !prev);
                }}
              >
                <ThemedText type="default">{choreTask.name}</ThemedText>
              </Pressable>
              {!isManagerView && (
                <Pressable
                  onPress={() => {
                    setShowMore((prev) => !prev);
                  }}
                  style={{ marginRight: "1%" }}
                >
                  <Image
                    source={
                      showMore
                        ? require("@/assets/icons/chevron-up.png")
                        : require("@/assets/icons/chevron-down.png")
                    }
                    style={styles.icon}
                  />
                </Pressable>
              )}
            </View>
            {choreTask.choreId && (
              <ThemedCheckbox
                label="Primary"
                background={checkbgColor}
                checked={checked}
                onChange={setChecked}
              />
            )}
          </View>
        </ThemedView>
        {showMore && !isManagerView ? (
          <View style={{ paddingBottom: 20 }}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <View style={{ width: "48%" }}>
                <ThemedText type="default">Date</ThemedText>
                <ThemedDatePicker
                  background={checkbgColor}
                  placeholder="dd-mm-yyyy"
                  value={date}
                  onChangeText={setDate}
                  errorMessage={errors.date}
                />
              </View>
              <View style={{ width: "48%" }}>
                <ThemedText type="default">Time</ThemedText>
                <ThemedTimePicker
                  background={checkbgColor}
                  placeholder="hh-mm"
                  value={time}
                  onChangeText={setTime}
                  errorMessage={errors.time}
                />
              </View>
            </View>

            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <View style={{ width: "65%" }}>
                <ThemedText type="default">Description</ThemedText>
                <ThemedTextArea
                  background={checkbgColor}
                  placeholder="Message"
                  value={message}
                  onChangeText={setMessage}
                  errorMessage={errors.message}
                  height={100}
                />
              </View>

              <View style={{ width: "30%" }}>
                <View style={styles.ImageContainer}>
                  <ThemedText type="default">Image</ThemedText>
                  <Image
                    source={
                      capturedImage
                        ? { uri: capturedImage }
                        : require("@/assets/images/placeholder.jpg")
                    }
                    style={{ width: "100%", height: 100, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>

            <View style={[styles.row, { alignItems: "center", marginTop: 10 }]}>
              <Button
                type="default"
                title="Submit for Review"
                onPress={handleTaskSubmit}
                loading={loading}
                style={{ flex: 1 }}
              />
              <Button
                type="icon-default"
                icon={require("@/assets/icons/camera.png")}
                onPress={() => setCameraVisible(true)}
              />
            </View>
          </View>
        ) : (
          <ThemedView></ThemedView>
        )}
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
                type="icon-default"
                icon={require("@/assets/icons/dismiss.png")}
                onPress={() => setCameraVisible(false)}
              />
              <Button
                type="icon-default"
                icon={require("@/assets/icons/camera.png")}
                style={{ height: 80, width: 80 }}
                iconStyle={{ height: 40, width: 40 }}
                onPress={takePicture}
              />
              <Button
                type="icon-default"
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
    width: "100%",
    marginBottom: 16,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  title: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 15,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    width: 20,
    height: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  ImageContainer: {
    flex: 1,
  },
});
