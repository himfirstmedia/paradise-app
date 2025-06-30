import { ThemedTextInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

export default function AddHouseScreen() {
  const navigation = useRouter();
  const { reload } = useReduxHouse();
  const params = useLocalSearchParams();

  // If editing, params will have id, name, abbreviation, capacity
  const isEdit = !!params.id;

  const [houseName, setHouseName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);

  // Prepopulate fields if editing
  useEffect(() => {
    if (isEdit) {
      setHouseName(typeof params.name === "string" ? params.name : "");
      setAbbreviation(typeof params.abbreviation === "string" ? params.abbreviation : "");
      setCapacity(params.capacity ? String(params.capacity) : "");
    } else {
      setHouseName("");
      setAbbreviation("");
      setCapacity("");
    }
  }, [isEdit, params]);

  const handleSubmit = async () => {
    if (!houseName || !abbreviation || !capacity) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/houses/${params.id}`, {
          name: houseName,
          abbreviation,
          capacity: Number(capacity),
        });
        Alert.alert("Success", "House updated successfully!");
      } else {
        await api.post("/houses", {
          name: houseName,
          abbreviation,
          capacity: Number(capacity),
        });
        Alert.alert("Success", "House created successfully!");
      }
      await reload();
      navigation.back();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to save house.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemedText type="title" style={{ marginBottom: "4%" }}>
            {isEdit ? "Update House" : "Create House"}
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">House Full Name</ThemedText>
            <ThemedTextInput
              type="default"
              placeholder="Enter house full name"
              value={houseName}
              onChangeText={setHouseName}
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Short Name</ThemedText>
            <ThemedTextInput
              type="default"
              placeholder="Enter house short name"
              value={abbreviation}
              onChangeText={setAbbreviation}
            />
          </ThemedView>
          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Capacity</ThemedText>
            <ThemedTextInput
              type="default"
              placeholder="Enter house capacity"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </ThemedView>

          <Button
            title={isEdit ? "Update House" : "Create House"}
            onPress={handleSubmit}
            loading={loading}
          />
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inputField: {
    width: "100%",
    gap: 2,
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
});