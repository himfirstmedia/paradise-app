/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
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
import { useReduxChores } from "@/hooks/useReduxChores";
import type { Chore } from "@/types/chore";
import { useRouter } from "expo-router";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface ChoreCardProps {
  chores?: Chore[];
  style?: ViewStyle;
  onPress?: (chore: Chore) => void;
  currentUserRole?: string;
}

type ChoreCategory = "MAINTENANCE" | "HOUSEHOLD" | "SUPPORT" | "REVIEW";
type ChoreStatus = "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";

export function ChoreCard({ onPress, chores }: ChoreCardProps) {
  const router = useRouter();
  const bgColor = useThemeColor({}, "input");
  const checkbgColor = useThemeColor({}, "background");
  const [visible, setVisible] = useState(false);

  const { user } = useReduxAuth();
  const currentUserRole = user?.role || "";

  // State management
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [expandedChores, setExpandedChores] = useState<Record<string, boolean>>(
    {}
  );
  const [choreFormData, setChoreFormData] = useState<Record<string, any>>({});
  const [choreErrors, setChoreErrors] = useState<Record<string, any>>({});
  const [capturedImages, setCapturedImages] = useState<
    Record<string, string | null>
  >({});
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentChoreId, setCurrentChoreId] = useState<number | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const { chores: reduxChores, loading, error, reload } = useReduxChores();
  const choresToUse = chores ?? reduxChores;
  const showLoading = chores ? false : loading;
  const showError = chores ? null : error;

  // Initialize form data for chores
  useEffect(() => {
    const initialData: Record<string, any> = {};
    choresToUse.forEach((chore) => {
      initialData[chore.id] = {
        date: "",
        time: "",
        message: "",
        checked: !!chore.choreId,
      };
    });
    setChoreFormData(initialData);
  }, [choresToUse]);

  const filteredChores = (chores ?? reduxChores).filter(
    (chore) => chore.status !== "REVIEWING"
  );

  const groupedChoresByHouse: Record<string, Chore[]> = {};

  filteredChores.forEach((chore) => {
    const houseName = chore.house?.name || "Unassigned House";
    if (!groupedChoresByHouse[houseName]) {
      groupedChoresByHouse[houseName] = [];
    }
    groupedChoresByHouse[houseName].push(chore as Chore);
  }); 

  const takePicture = async () => {
    if (cameraRef.current && cameraReady && currentChoreId) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.saveToLibraryAsync(photo.uri);

        setCapturedImages((prev) => ({
          ...prev,
          [currentChoreId]: photo.uri,
        }));

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

  const handleFormChange = (choreId: number, field: string, value: string) => {
    setChoreFormData((prev) => ({
      ...prev,
      [choreId]: {
        ...prev[choreId],
        [field]: value,
      },
    }));
  };

  const handleChoreSubmit = async (chore: Chore) => {
    const formData = choreFormData[chore.id];
    if (!formData) return;

    const newErrors = {
      date: formData.date.trim() === "" ? "Date is required" : "",
      time: formData.time.trim() === "" ? "Time is required" : "",
      message: formData.message.trim() === "" ? "Message is required" : "",
    };

    setChoreErrors((prev) => ({
      ...prev,
      [chore.id]: newErrors,
    }));

    const hasErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasErrors) return;

    try {
      setLoadingStates((prev) => ({ ...prev, [chore.id]: true }));

      const submitData = new FormData();
      const image = capturedImages[chore.id];

      if (image) {
        const fileInfo = await FileSystem.getInfoAsync(image);
        submitData.append("image", {
          uri: fileInfo.uri,
          name: "chore-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      submitData.append("status", "REVIEWING");

      await api.put(`/chores/${chore.id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await reload();
      Alert.alert(
        "Chore Submitted",
        "Chore marked as completed and is now under review."
      );

      setExpandedChores((prev) => ({ ...prev, [chore.id]: false }));
    } catch (error: any) {
      console.log("Chore submission failure", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to update chore status."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [chore.id]: false }));
    }
  };

  const toggleChoreExpand = (choreId: number) => {
    setExpandedChores((prev) => ({
      ...prev,
      [choreId]: !prev[choreId],
    }));
  };

  const toggleCategoryExpand = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isManagerView =
    currentUserRole === "DIRECTOR" || currentUserRole?.includes("MANAGER");

  const disabledForChore = (chore: any) =>
    !["PENDING", "APPROVED"].includes(chore.status);

  if (showLoading) return <ThemedText>Loading chores...</ThemedText>;
  if (showError) return <ThemedText>Error: {showError}</ThemedText>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedChoresByHouse).map((houseName) => {
          const houseChores = groupedChoresByHouse[houseName];
          if (!houseChores || houseChores.length === 0) return null;

          const showViewAll = houseChores.length > 5;
          const isHouseExpanded = expandedCategories[houseName] || false;
          const displayedChores = isHouseExpanded
            ? houseChores
            : houseChores.slice(0, 5);

          return (
            <ThemedView style={styles.categoryContainer} key={houseName}>
              <ThemedView style={[styles.categoryHeader, { marginBottom: 12 }]}>
                {currentUserRole !== "RESIDENT" && (
                  <ThemedText type="subtitle">{houseName}</ThemedText>
                )}

                {showViewAll && (
                  <Pressable onPress={() => toggleCategoryExpand(houseName)}>
                    <ThemedText type="default">
                      {isHouseExpanded ? "View Less" : "View All"}
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedView>

              <ThemedView style={styles.choreCardsContainer}>
                {displayedChores.map((chore) => {
                  const isExpanded = expandedChores[chore.id] || false;
                  const formData = choreFormData[chore.id] || {};
                  const errors = choreErrors[chore.id] || {};
                  const capturedImage = capturedImages[chore.id] || null;
                  const loading = loadingStates[chore.id] || false;
                  const disabled = disabledForChore(chore);

                  return (
                    <ThemedView
                      key={chore.id}
                      style={[styles.choreCard, { backgroundColor: bgColor }]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.choreInfo}>
                          <Tooltip
                            infoTitle="Chore Details"
                            infoText={chore.description}
                          />
                          <Pressable
                            onPress={() =>
                              !isManagerView && toggleChoreExpand(chore.id)
                            }
                            style={{ marginRight: 12 }}
                          >
                            <ThemedText type="default" style={styles.choreName}>
                              {chore.name}
                            </ThemedText>
                          </Pressable>
                          <View style={styles.choreActions}>
                            {!isManagerView && (
                              <Pressable
                                onPress={() => toggleChoreExpand(chore.id)}
                              >
                                <Image
                                  source={
                                    isExpanded
                                      ? require("@/assets/icons/chevron-up.png")
                                      : require("@/assets/icons/chevron-down.png")
                                  }
                                  style={styles.expandIcon}
                                />
                              </Pressable>
                            )}
                            {chore.isPrimary === true && !isManagerView && (
                              <ThemedCheckbox
                                background={checkbgColor}
                                checked={chore.isPrimary}
                                onChange={(checked) =>
                                  handleFormChange(
                                    chore.id,
                                    chore.isPrimary ? "checked" : "status",
                                    checked ? "true" : "false"
                                  )
                                }
                                disabled={disabled}
                                style={styles.checkbox}
                              />
                            )}
                          </View>
                        </View>
                      </View>

                      {isExpanded && !isManagerView && (
                        <View style={styles.choreForm}>
                          {/* Date & Time */}
                          <View style={styles.datetimeRow}>
                            <View style={styles.datetimeInput}>
                              <ThemedText type="defaultSemiBold">
                                Date
                              </ThemedText>
                              <ThemedDatePicker
                                background={checkbgColor}
                                placeholder="mm-dd-yyyy"
                                value={formData.date}
                                onChangeText={(text) =>
                                  handleFormChange(chore.id, "date", text)
                                }
                                errorMessage={errors.date}
                                disabled={disabled}
                              />
                            </View>
                            <View style={styles.datetimeInput}>
                              <ThemedText type="defaultSemiBold">
                                Time
                              </ThemedText>
                              <ThemedTimePicker
                                background={checkbgColor}
                                placeholder="hh-mm"
                                value={formData.time}
                                onChangeText={(text) =>
                                  handleFormChange(chore.id, "time", text)
                                }
                                errorMessage={errors.time}
                                disabled={disabled}
                              />
                            </View>
                          </View>

                          {/* Description & Image */}
                          <View style={styles.descriptionRow}>
                            <View style={styles.descriptionInput}>
                              <ThemedText type="defaultSemiBold">
                                Description
                              </ThemedText>
                              <ThemedTextArea
                                background={checkbgColor}
                                placeholder="Add details about chore completion"
                                value={formData.message}
                                onChangeText={(text) =>
                                  handleFormChange(chore.id, "message", text)
                                }
                                errorMessage={errors.message}
                                height={100}
                                disabled={disabled}
                              />
                            </View>
                            <View style={styles.imageContainer}>
                              <ThemedText type="defaultSemiBold">
                                Image
                              </ThemedText>
                              <Image
                                source={
                                  capturedImage
                                    ? { uri: capturedImage }
                                    : require("@/assets/images/placeholder.jpg")
                                }
                                style={styles.imagePreview}
                              />
                            </View>
                          </View>

                          {/* Actions */}
                          <View style={styles.formActions}>
                            <Button
                              type="default"
                              title="Submit for Review"
                              onPress={() => handleChoreSubmit(chore)}
                              loading={loading}
                              style={{ flex: 1 }}
                              disabled={disabled}
                            />
                            <Button
                              type="icon-default"
                              icon={require("@/assets/icons/camera.png")}
                              onPress={() => {
                                setCurrentChoreId(chore.id);
                                setCameraVisible(true);
                              }}
                              disabled={disabled}
                            />
                          </View>
                        </View>
                      )}
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </ThemedView>
          );
        })}
      </ScrollView>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            ref={cameraRef}
            onCameraReady={() => setCameraReady(true)}
          >
            <View style={styles.cameraControls}>
              <Button
                type="icon-default"
                icon={require("@/assets/icons/dismiss.png")}
                onPress={() => setCameraVisible(false)}
              />
              <Button
                type="icon-default"
                icon={require("@/assets/icons/camera.png")}
                style={styles.captureButton}
                iconStyle={styles.captureIcon}
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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  categoryContainer: {
    width: "100%",
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choreCardsContainer: {
    gap: 12,
  },
  choreCard: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choreInfo: {
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
  },
  choreName: {
    marginLeft: 12,
    // borderWidth: 1,
  },
  choreActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flex: 1,
    // borderWidth: 1,
  },
  expandIcon: {
    width: 20,
    height: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  choreForm: {
    marginTop: 16,
  },
  datetimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  datetimeInput: {
    width: "48%",
  },
  descriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  descriptionInput: {
    width: "65%",
  },
  imageContainer: {
    width: "30%",
  },
  imagePreview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  formActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  captureButton: {
    height: 80,
    width: 80,
  },
  captureIcon: {
    height: 40,
    width: 40,
  },
  tooltip: {
    padding: 15,
    borderRadius: 8,
    maxWidth: "80%",

    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipText: {
    fontSize: 14,
    marginTop: 20,
  },
});
