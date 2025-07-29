import { ThemedDatePicker, ThemedTextInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface HouseFormValues {
  houseName: string;
  abbreviation: string;
  capacity: string;
  workPeriodStart?: string;
  workPeriodEnd?: string;
}

export interface HouseFormProps {
  mode: "add" | "edit";
  initialValues: {
    houseName: string;
    abbreviation: string;
    capacity: string;
    workPeriodStart?: string;
    workPeriodEnd?: string;
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
  const [startDate, setStartDate] = useState<string | undefined>(
    initialValues.workPeriodStart
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    initialValues.workPeriodEnd
  );

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

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

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ThemedText type="title" style={{ marginBottom: 16 }}>
          {mode === "add" ? "Create House" : "Update House"}
        </ThemedText>

        {/* House Name */}
        <ThemedView style={styles.inputField}>
          <ThemedText type="default">
            House Full Name <Dot />
          </ThemedText>
          <ThemedTextInput
            placeholder="Enter house full name"
            value={houseName}
            onChangeText={setHouseName}
            maxLength={50}
          />
        </ThemedView>

        <ThemedView style={styles.row}>
          {/* Short Name */}
          <ThemedView style={[styles.inputField, { width: "48%" }]}>
            <ThemedText type="default">
              Short Name <Dot />
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter house short name"
              value={abbreviation}
              onChangeText={setAbbreviation}
              maxLength={10}
            />
          </ThemedView>

          {/* Capacity */}
          <ThemedView style={[styles.inputField, { width: "48%" }]}>
            <ThemedText type="default">
              Capacity <Dot />
            </ThemedText>
            <ThemedTextInput
              placeholder="Enter house capacity"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </ThemedView>
        </ThemedView>

        <ThemedText type="title" style={{ marginBottom: 10 }}>
          Work Period
        </ThemedText>

        <ThemedView style={styles.row}>
          {/* Work Period Start */}
          <ThemedView style={[styles.inputField, { width: "48%" }]}>
            <ThemedText type="default">
              Period Start <Dot />
            </ThemedText>
            <ThemedDatePicker
              value={startDate}
              onChangeText={setStartDate}
              placeholder="Select start date"
            />
          </ThemedView>

          {/* Work Period End */}
          <ThemedView style={[styles.inputField, { width: "48%" }]}>
            <ThemedText type="default">
              Period End <Dot />
            </ThemedText>
            <ThemedDatePicker
              value={endDate}
              onChangeText={setEndDate}
              placeholder="Select end date"
            />
          </ThemedView>
        </ThemedView>

        <Button
          title={mode === "add" ? "Create House" : "Update House"}
          onPress={() => {
            onSubmit({
              houseName,
              abbreviation,
              capacity,
              workPeriodStart: startDate,
              workPeriodEnd: endDate,
            });
            // console.log(
            //   `🏠 House Info -> Name: ${houseName}, Abbreviation: ${abbreviation}, Capacity: ${capacity}, Work Period Start: ${startDate}, Work Period End: ${endDate}`
            // );
          }}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
