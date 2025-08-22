import {
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChores } from "@/hooks/useReduxChores";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import { useThemeColor } from "@/hooks/useThemeColor";
import { House } from "@/types/house";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

type HouseOption = {
  label: string;
  value: string;
};

export default function UpdateChoreScreen() {
  const { id } = useLocalSearchParams();
  const choreId = id ? parseInt(id as string) : null;
  const errorColor = useThemeColor({}, "overdue");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const { houses, reload: houseReload } = useReduxHouse();
  const { chores, reload: choreReload } = useReduxChores();
  const { user } = useReduxAuth();

  const choreToUpdate = choreId ? chores.find((c) => c.id === choreId) : null;

  const [choreName, setChoreName] = useState(choreToUpdate?.name || "");
  const [house, setHouse] = useState(choreToUpdate?.house?.id.toString() || "");
  const [description, setDescription] = useState(
    choreToUpdate?.description || ""
  );

  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const navigation = useRouter();

  const showHouseDropdown =
    user?.role === "DIRECTOR" ||
    user?.role === "MANAGER" ||
    user?.role === "SUPER_ADMIN";

  const filteredHouseOptions: HouseOption[] = showHouseDropdown
    ? houses?.map((h: House) => ({
        label: h.abbreviation,
        value: h.id.toString(),
      })) ?? []
    : houses
        ?.filter((h: House) => h.id === user?.houseId)
        .map((h: House) => ({
          label: h.abbreviation,
          value: h.id.toString(),
        })) ?? [];

  const handleChoreUpdate = async () => {
    const newErrors: Record<string, string> = {};

    if (!choreName) newErrors.choreName = "Chore name is required.";
    if (!house) newErrors.house = "House is required.";
    if (!description) newErrors.description = "Chore Description is required.";

    setErrors(newErrors);

    setLoading(true);
    try {
      await api.put(`/chores/${choreId}`, {
        name: choreName,
        house,
        description,
        status: "PENDING",
      });
      Alert.alert("Success", "Chore updated successfully!");
      setChoreName("");
      setHouse("");
      setDescription("");
      setErrors({});
      await choreReload();
      await houseReload();
      navigation.back();
    } catch {
      Alert.alert("Error", "Failed to update chore.");
    } finally {
      setLoading(false);
    }
  };

  const Dot = () => {
    return <ThemedText style={{ color: errorColor }}>*</ThemedText>;
  };

  const responsiveStyles = StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isLargeScreen ? 40 : 20,
    },
    containerPadding: {
      paddingHorizontal: isLargeScreen ? 150 : isMediumScreen ? 40 : 5,
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS === "web" && { minHeight: "100%" },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={{ marginBottom: 15 }}>
            Update Chore
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Chore Name <Dot />
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter chore name"
              value={choreName}
              onChangeText={(text) => {
                setChoreName(text);
                if (errors.choreName)
                  setErrors((e) => ({ ...e, choreName: "" }));
              }}
              errorMessage={errors.choreName}
            />
          </ThemedView>

          {showHouseDropdown && (
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">
                House <Dot />
              </ThemedText>
              <ThemedDropdown
                placeholder="Select House"
                items={filteredHouseOptions}
                value={
                  filteredHouseOptions.find((opt) => opt.value === house)
                    ?.label || ""
                }
                onSelect={(label) => {
                  const selected = filteredHouseOptions.find(
                    (opt) => opt.label === label
                  );
                  setHouse(selected?.value || "");
                  if (errors.house) setErrors((e) => ({ ...e, house: "" }));
                }}
                errorMessage={errors.house}
                multiSelect={false}
              />
            </ThemedView>
          )}

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">
              Description <Dot />
            </ThemedText>
            <ThemedTextArea
              placeholder="Enter chore description"
              height={200}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description)
                  setErrors((e) => ({ ...e, description: "" }));
              }}
              errorMessage={errors.description}
            />
          </ThemedView>

          <ThemedView style={{ marginTop: "5%", width: "100%" }}>
            <Button
              type="default"
              title="Update Chore"
              onPress={handleChoreUpdate}
              loading={loading}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    flex: 1,
  },
  inputField: {
    width: "100%",
    gap: 2,
  },
  keyboardAvoid: {
    width: "100%",
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
