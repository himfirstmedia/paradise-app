import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Tooltip } from "./ui/Tooltip";
import { Chore } from "@/types/chore";

interface ChoreCardProps {
  chores: Chore[];
  style?: ViewStyle;
}

export function PrimaryChoreCard({ chores, style }: ChoreCardProps) {
  const bgColor = useThemeColor({}, "input");
  const primaryColor = useThemeColor({}, "selection");

  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const primaryChores = (chores || []).filter(
    (chore) => chore.isPrimary === true
  );

  const handleChorePress = (chore: Chore) => {
    setSelectedChore(chore);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedChore(null);
  };

  if (primaryChores.length === 0) {
    return (
      <ThemedView style={[styles.container, style]}>
        <ThemedText type="subtitle" style={styles.title}>
          Your Current Primary Chore is:
        </ThemedText>
        <View style={[styles.card, { backgroundColor: bgColor }]}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={[styles.container, style]}>
        <View style={[styles.row, { gap: 10, marginBottom: 10 }]}>
          {primaryChores.length !== 1 ? (
            <ThemedText type="subtitle" style={styles.title}>
              Your Current Primary Chores are:
            </ThemedText>
          ) : (
            <ThemedText type="subtitle" style={styles.title}>
              Your Current Primary Chore is:
            </ThemedText>
          )}
        </View>
        {primaryChores.map((item) => (
          <View
            key={item.id}
            style={[
              styles.row,
              {
                backgroundColor: bgColor,
                borderRadius: 15,
                paddingHorizontal: 15,
                marginBottom: 8,
              },
            ]}
          >
            <Tooltip
              infoTitle="Chore Details"
              infoText={item.description ?? "No description available"}
            />
            <Pressable
              style={[styles.card, { flex: 1 }]}
              onPress={() => handleChorePress(item)}
            >
              <ThemedText type="default">{item.name}</ThemedText>
            </Pressable>
          </View>
        ))}

        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <Pressable style={styles.overlay} onPress={handleCloseModal}>
            <ThemedView
              style={[styles.tooltip, { backgroundColor: bgColor }]}
              onStartShouldSetResponder={() => true} // Prevents click-through to overlay
            >
              <ThemedText type="subtitle">Chore details</ThemedText>
              <ThemedText type="default" style={styles.tooltipText}>
                {selectedChore?.description || "No description available"}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Modal>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  title: {
    // marginBottom: 12,
  },
  card: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
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
    alignItems: "center",
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