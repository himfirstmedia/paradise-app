import {
  ThemedCheckbox,
  ThemedDropdown,
  ThemedTextArea,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChores } from "@/hooks/useReduxChores";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function AssignChoreScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;
  const params = useLocalSearchParams();
  const preselectedMember =
    typeof params.memberName === "string" ? params.memberName : "";
  const { members, reload: reloadMembers } = useReduxMembers();
  const {
    chores,
    loading: choresLoading,
    reload: reloadChores,
  } = useReduxChores();
  const [selectedMember, setSelectedMember] =
    useState<string>(preselectedMember);
  const [selectedChoreId, setSelectedChoreId] = useState<string | number>();
  const [instruction, setInstruction] = useState<string>("");
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();
  const { user: currentUser } = useReduxAuth();

  const isDirector =
    currentUser?.role === "DIRECTOR" || currentUser?.role === "SUPER_ADMIN";

  const visibleChores = useMemo(() => {
    if (isDirector) {
      return chores.filter(
        (chore) => chore.house?.abbreviation === "LLW House"
      );
    }

    // Managers see only chores in their house
    if (currentUser?.houseId) {
      return chores.filter(
        (chore) =>
          chore.houseId === currentUser.houseId && chore.status === "PENDING"
      );
    }

    // Other users see all chores (or empty if preferred)
    return chores;
  }, [chores, currentUser, isDirector]);

  const choreOptions = useMemo(() => {
    return visibleChores.map((chore) => ({
      label: chore.name,
      value: chore.id.toString(),
    }));
  }, [visibleChores]);


  const handleChoreAssignment = async () => {

    if (!selectedMember || !selectedChoreId) {
      Alert.alert("Missing Fields", "Please select a member and a chore.");
      return;
    }

    setLoading(true);
    try {
      const member = members.find((m) => m.name === selectedMember);
      if (!member) throw new Error("Selected member not found.");

      // Convert the string ID back to a number
      const choreId = selectedChoreId;
      const chore = chores.find((t) => t.id === choreId);
      if (!chore) throw new Error("Selected chore not found.");

      const payload = {
        userId: member.id,
        instruction,
        isPrimary,
      };

      console.log("Chore Payload: ", payload);

      await api.post(`/chores/${choreId}/assign`, payload);

      setSelectedChoreId(undefined);
      setSelectedMember("");
      setInstruction("");
      setIsPrimary(false);

      reloadMembers();
      reloadChores();

      navigation.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to assign chore."
      );
    } finally {
      setLoading(false);
    }
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
    choreSection: {
      marginTop: isLargeScreen ? 10 : 5,
    },
  });

  return (
    <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          width: "100%",
          paddingBottom: "20%",
        }}
        showsVerticalScrollIndicator={false}
        style={styles.innerContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
        >
          <ThemedText type="title" style={{ marginBottom: 30, marginTop: 15 }}>
            Assign Resident Chore
          </ThemedText>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Assigning To</ThemedText>
            <ThemedTextInput
              type="default"
              value={selectedMember}
              editable={false}
              placeholder="No member selected"
            />
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Chore</ThemedText>
            {choresLoading ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <>
                <ThemedDropdown
                  placeholder={
                    choreOptions.length === 0
                      ? "No chores available"
                      : "Select Chore"
                  }
                  value={selectedChoreId}
                  onSelect={(value) => {
                    setSelectedChoreId(value);
                  }}
                  items={choreOptions}
                  multiSelect={false}
                />
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.inputField}>
            <ThemedText type="default">Special Instructions</ThemedText>
            <ThemedTextArea
              placeholder="Enter special instructions(optional)"
              value={instruction}
              onChangeText={setInstruction}
              height={200}
            />
          </ThemedView>

          <ThemedView style={[styles.inputField, { marginBottom: 20 }]}>
            <ThemedCheckbox
              label="Select if chore is primary"
              checked={isPrimary}
              onChange={setIsPrimary}
            />
          </ThemedView>

          <Button
            onPress={handleChoreAssignment}
            title="Assign Chore"
            loading={loading}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
});
