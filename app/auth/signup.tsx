import {
  ThemedDropdown,
  ThemedEmailInput,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxMembers } from "@/hooks/useReduxMembers";
import api from "@/utils/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";

const genderMap: Record<string, string> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
};

const roleMap: Record<string, string> = {
  Director: "DIRECTOR",
};

const roleOptions = ["Director"];

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { reload } = useReduxMembers();
  const navigation = useRouter();

  const handleMemberCreation = async (): Promise<void> => {
    if (
      !name ||
      !email ||
      !phone ||
      !gender ||
      !selectedRole
    ) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users", {
        name,
        email,
        phone,
        gender: genderMap[gender] || gender,
        role: roleMap[selectedRole] || selectedRole,
        password: name.replace(/\s+/g, "").toLowerCase(),
        joinedDate: new Date().toISOString(),
        city,
        state,
        zipCode,
      });
      await reload();
      Alert.alert("Success", "Director created successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setGender("");
      setSelectedRole("Director");
      navigation.replace("/(resident-manager)/teams");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to create director."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.container}>
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <ThemedText type="title" style={{ marginBottom: "10%" }}>
              New Director
            </ThemedText>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Name</ThemedText>
              <ThemedTextInput
                placeholder="Enter full name"
                value={name}
                onChangeText={setName}
              />
            </ThemedView>
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Email Address</ThemedText>
              <ThemedEmailInput
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
              />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Phone</ThemedText>
              <ThemedEmailInput
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
              />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Gender</ThemedText>
              <ThemedDropdown
                placeholder="Select gender"
                items={["Male", "Female"]}
                value={gender}
                onSelect={setGender}
              />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Role</ThemedText>
              <ThemedDropdown
                placeholder="Select Role"
                items={roleOptions}
                value={selectedRole}
                onSelect={setSelectedRole}
                // disabled
              />
            </ThemedView>

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">City</ThemedText>
                  <ThemedTextInput
                    placeholder="Enter city"
                    value={city}
                    onChangeText={setCity}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">State</ThemedText>
                  <ThemedTextInput
                    placeholder="Enter state"
                    value={state}
                    onChangeText={setState}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Zip Code</ThemedText>
              <ThemedTextInput
                placeholder="Enter zip code"
                value={zipCode}
                onChangeText={setZipCode}
              />
            </ThemedView>

            <ThemedView style={{ marginTop: "5%", width: "100%" }}>
              <Button
                type="default"
                title="Create Director"
                onPress={handleMemberCreation}
                loading={loading}
              />
            </ThemedView>
          </KeyboardAvoidingView>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "5%",
    paddingHorizontal: 15,
  },
  inputField: {
    width: "100%",
  },
  keyboardAvoid: {
    width: "100%",
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    },
});