import {
  ThemedDropdown,
  ThemedEmailInput,
  ThemedTextInput,
} from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function AddMemberScreen() {
  const handlePasswordChange = (): void => {};

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "20%",
          }}
          style={styles.innerContainer}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          >
            <ThemedText type="title" style={{ marginBottom: "10%" }}>
              New Member
            </ThemedText>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Name</ThemedText>
              <ThemedTextInput placeholder="Enter full name" />
            </ThemedView>
            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Email Address</ThemedText>
              <ThemedEmailInput placeholder="Enter email address" />
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">Phone</ThemedText>
              <ThemedEmailInput placeholder="Enter phone number" />
            </ThemedView>

            <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">Gender</ThemedText>
                  <ThemedDropdown
                    placeholder="Select gender"
                    items={["Male", "Female"]}
                  />
                </ThemedView>
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedView style={styles.inputField}>
                  <ThemedText type="default">Role</ThemedText>
                  <ThemedDropdown
                    placeholder="Select role"
                    items={["Resident", "Individual"]}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputField}>
              <ThemedText type="default">House</ThemedText>
              <ThemedDropdown
                placeholder="Select house"
                items={["LLW House", "CE House"]}
              />
            </ThemedView>

            {/* <ThemedView style={styles.row}>
              <ThemedView style={{ width: "48%" }}>
                <ThemedText type="default">City</ThemedText>
                <ThemedTextInput placeholder="Enter city" />
              </ThemedView>
              <ThemedView style={{ width: "48%" }}>
                <ThemedText type="default">State</ThemedText>
                <ThemedTextInput placeholder="Enter state" />
              </ThemedView>
            </ThemedView> */}

            {/* <ThemedView style={styles.inputField}>
              <ThemedText type="default">Zip Code</ThemedText>
              <ThemedTextInput placeholder="Enter zip code" />
            </ThemedView> */}

            <ThemedView style={{ marginTop: "5%", width: "100%" }}>
              <Button
                type="default"
                title="Create Member"
                onPress={handlePasswordChange}
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
