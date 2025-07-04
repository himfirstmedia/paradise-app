import React, { useState, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  findNodeHandle,
  UIManager,
  Dimensions,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Image } from "expo-image";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import { useReduxHouse } from "@/hooks/useReduxHouse";

export interface House {
  id: number;
  name: string;
  abbreviation: string;
  capacity: number;
  users: { id: number }[];
}

interface HouseCardProps {
  houses: House[];
  style?: any;
}

// Helper to format house names
function getFriendlyHouseName(name: string) {
  const map: Record<string, string> = {
    LILLIE_LOUISE_WOERMER_HOUSE: "Lillie Louise Woermer House",
    CAROLYN_ECKMAN_HOUSE: "Carolyn Eckman House",
    "LLW House": "LLW House",
    "CE House": "CE House",
    Administration: "Administration",
    ADIMINISTRATION: "Administration",
  };
  return map[name.trim()] || name;
}

export function HouseCard({ houses, style }: HouseCardProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const [expanded, setExpanded] = useState(false);
  const {reload} = useReduxHouse();
  const [popoverVisible, setPopoverVisible] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const navigation = useRouter();
  const optionBtnRefs = useRef<Record<number, any>>({});

  if (!houses || houses.length === 0) return null;

  const showViewAll = houses.length > 4;
  const displayedHouses =
    showViewAll && !expanded ? houses.slice(0, 4) : houses;

  const POPOVER_WIDTH = 180;

  const showPopover = (houseId: number) => {
    const ref = optionBtnRefs.current[houseId];
    if (ref) {
      const screenWidth = Dimensions.get("window").width;
      const nodeHandle = findNodeHandle(ref);
      if (nodeHandle != null) {
        UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
          let left = pageX;
          const verticalOffset = -45;
          if (left + POPOVER_WIDTH > screenWidth) {
            left = screenWidth - POPOVER_WIDTH - 20;
          }
          setPopoverPosition({ top: pageY + height + verticalOffset, left });
          setPopoverVisible(houseId);
        });
      } else {
        setPopoverVisible(houseId);
      }
    } else {
      setPopoverVisible(houseId);
    }
  };

  const handleEdit = (house: House) => {
    setPopoverVisible(null);
    navigation.push({
      pathname: "/edit-house",
      params: {
        id: house.id,
        name: house.name,
        abbreviation: house.abbreviation,
        capacity: house.capacity,
      },
    });
  };

  const handleDelete = (house: House) => {
  setPopoverVisible(null);
  Alert.alert("Delete House", "Are you sure you want to delete this house?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await api.delete(`/houses/${house.id}`);
          Alert.alert("Deleted", "House deleted successfully.");
          await reload();
        } catch (error) {
          console.error("Delete failed:", error);
          Alert.alert("Error", "Failed to delete the house.");
        }
      },
    },
  ]);
};


  const handleView = (house: House) => {
    setPopoverVisible(null);
    navigation.push({
      pathname: "/house-detail",
      params: {
        id: house.id,
      },
    });
  };

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedView style={[styles.row, { marginBottom: "4%" }]}>
        <ThemedText type="subtitle">
          {houses.length === 1 ? "Current House" : "Current Houses"}
        </ThemedText>
        {showViewAll && (
          <Pressable onPress={() => setExpanded((prev) => !prev)}>
            <ThemedText type="default">
              {expanded ? "View Less" : "View All"}
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
      <ThemedView style={styles.houseButtons}>
        {displayedHouses.map((house) => (
          <ThemedView
            key={house.id}
            style={[styles.row, styles.button, { backgroundColor: bgColor }]}
          >
            <View>
              <ThemedText type="subtitle">
                {getFriendlyHouseName(house.name)}
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: "#888" }}>
                ({house.abbreviation})
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                {house.users.length} / {house.capacity} Occupied
              </ThemedText>
            </View>
            <Pressable
              ref={(ref) => {
                optionBtnRefs.current[house.id] = ref;
              }}
              style={styles.optionBtn}
              onPress={() => showPopover(house.id)}
            >
              <Image
                source={require("../assets/icons/options.png")}
                style={{ width: 24, height: 24, tintColor: textColor }}
              />
            </Pressable>
            {/* Popover */}
            <Modal
              visible={popoverVisible === house.id}
              transparent
              animationType="fade"
              onRequestClose={() => setPopoverVisible(null)}
            >
              <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => setPopoverVisible(null)}
              >
                <ThemedView
                  style={[
                    styles.popover,
                    {
                      position: "absolute",
                      top: popoverPosition.top,
                      left: popoverPosition.left,
                    },
                  ]}
                >
                  <Pressable
                    style={styles.popoverButton}
                    onPress={() => handleView(house)}
                  >
                    <ThemedText type="default">View</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.popoverButton}
                    onPress={() => handleEdit(house)}
                  >
                    <ThemedText type="default">Edit</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.popoverButton}
                    onPress={() => handleDelete(house)}
                  >
                    <ThemedText type="default" style={{ color: "#d00" }}>
                      Delete
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </Pressable>
            </Modal>
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  houseButtons: {
    gap: 5,
  },
  button: {
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 90,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  optionBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  popover: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
  },
  popoverButton: {
    marginVertical: 5,
  },
});
