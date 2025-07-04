// components/HouseForm.tsx
import { ThemedTextInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface HouseFormValues {
  houseName: string;
  abbreviation: string;
  capacity: string;
}


export interface HouseFormProps {
  mode: "add" | "edit";
  initialValues: {
    houseName: string;
    abbreviation: string;
    capacity: string;
  };
  onSubmit: (values: HouseFormValues) => void;
  loading: boolean;
}

export function HouseForm({
  mode,
  initialValues,
  onSubmit,
  loading,
}: HouseFormProps) {
  const errorColor = useThemeColor({}, "overdue");
  const [houseName, setHouseName] = useState(initialValues.houseName);
  const [abbreviation, setAbbreviation] = useState(initialValues.abbreviation);
  const [capacity, setCapacity] = useState(initialValues.capacity);

  const Dot = () => {
    return (
      <ThemedText style={{ color: errorColor }}>*</ThemedText>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ThemedText type="title" style={{ marginBottom: 16 }}>
          {mode === "add" ? "Create House" : "Update House"}
        </ThemedText>

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">House Full Name <Dot /></ThemedText>
          <ThemedTextInput
            placeholder="Enter house full name"
            value={houseName}
            onChangeText={setHouseName}
            maxLength={50}
          />
        </ThemedView>

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Short Name <Dot /></ThemedText>
          <ThemedTextInput
            placeholder="Enter house short name"
            value={abbreviation}
            onChangeText={setAbbreviation}
            maxLength={10}
          />
        </ThemedView>

        <ThemedView style={styles.inputField}>
          <ThemedText type="default">Capacity <Dot /></ThemedText>
          <ThemedTextInput
            placeholder="Enter house capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />
        </ThemedView>

        <Button
          title={mode === "add" ? "Create House" : "Update House"}
          onPress={() => onSubmit({ houseName, abbreviation, capacity })}
          loading={loading}
        />
      </KeyboardAvoidingView>
    </ThemedView>
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
    gap: 8,
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
});
