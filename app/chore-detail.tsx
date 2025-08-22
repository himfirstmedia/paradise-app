import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxChores } from "@/hooks/useReduxChores";
import api from "@/utils/api";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet } from "react-native";

export default function ChoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useRouter();

  const { chores, reload } = useReduxChores();
  const [alertMessage, setAlertMessage] = useState("");

  const chore = chores.find((c) => c.id === Number(id));

  console.log("Chore Details: ", chore);

  const handleChoreDelete = async () => {
    try {
      await api.delete(`/chores/${chore?.id}`);
      setAlertMessage(`${chore?.name} has been successfully removed`);
      await reload();
      navigation.back();
    } catch {
      setAlertMessage("Failed to delete chore. Please try again.");
    }
  };

  const handleChoreApprove = async () => {
    try {
      await api.put(`/chores/${chore?.id}`, { status: "APPROVED" });
      setAlertMessage(`${chore?.name} has been approved`);
      await reload();
      navigation.back();
    } catch {
      setAlertMessage("Failed to approve chore. Please try again.");
    }
  };

  const handleChoreReject = async () => {
    try {
      await api.put(`/chores/${chore?.id}`, { status: "REJECTED" });
      setAlertMessage(`${chore?.name} has been rejected`);
      await reload();
      navigation.back();
    } catch {
      setAlertMessage("Failed to reject chore. Please try again.");
    }
  };

  if (alertMessage) {
    Alert.alert("Notification", alertMessage, [
      { text: "OK", onPress: () => setAlertMessage("") },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === "web" && { minHeight: "100%" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ marginBottom: 20 }}>
          Chore Details
        </ThemedText>

        {chore ? (
          <>
            <ThemedView style={[styles.row, { gap: 10 }]}>
              <ThemedText type="defaultSemiBold">Name:</ThemedText>
              <ThemedText>{chore.name}</ThemedText>
            </ThemedView>

            {chore.house && (
              <ThemedView style={[styles.row, { gap: 10 }]}>
                <ThemedText type="defaultSemiBold">House:</ThemedText>
                <ThemedText>{chore.house.name}</ThemedText>
              </ThemedView>
            )}

            {chore.description && (
              <ThemedView style={{ marginTop: 20 }}>
                <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
                  Description:
                </ThemedText>
                <ThemedText>{chore.description}</ThemedText>
              </ThemedView>
            )}

            {chore.image && (
              <ThemedView style={{ marginTop: 20 }}>
                <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
                  Image:
                </ThemedText>
                <Image source={chore.image} style={styles.imageCard}/>
              </ThemedView>
            )}
          </>
        ) : (
          <ThemedText>Chore not found.</ThemedText>
        )}

        {chore && (
          <ThemedView style={styles.ctaButtons}>
            {chore.status === "REVIEWING" ? (
              <>
                <Button
                  type="default"
                  title="Approve Chore"
                  onPress={handleChoreApprove}
                  style={{ flex: 1, marginRight: 10 }}
                />
                <Button
                  type="icon-default"
                  icon={require("@/assets/icons/dismiss.png")}
                  onPress={() =>
                    Alert.alert(
                      "Reject Chore",
                      `Are you sure you want to reject ${chore?.name}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Reject",
                          onPress: handleChoreReject,
                          style: "destructive",
                        },
                      ]
                    )
                  }
                />
              </>
            ) : chore.status === "PENDING" ? (
              <>
                <Button
                  type="default"
                  title="Update Chore"
                  onPress={() => {
                    navigation.push({
                      pathname: "/update-chore",
                      params: { id: chore?.id },
                    });
                  }}
                  style={{ flex: 1, marginRight: 10 }}
                />
                <Button
                  icon={require("@/assets/icons/delete.png")}
                  type="icon-default"
                  onPress={() => {
                    Alert.alert(
                      "Delete Chore",
                      `Are you sure you want to delete ${chore?.name}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          onPress: handleChoreDelete,
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                />
              </>
            ) : null}
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    width: "100%",
    paddingVertical: "5%",
    paddingHorizontal: 15,
    ...(Platform.OS === "web" && { overflow: "scroll" }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaButtons: {
    position: "absolute",
    bottom: "3%",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    gap: 10,
  },
  imageCard: {
    borderWidth: 1,
    height: 200,
    borderRadius: 20
  }
});
