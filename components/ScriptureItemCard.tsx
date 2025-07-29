import { useReduxScripture } from "@/hooks/useReduxScripture";
import { Scripture } from "@/redux/slices/scriptureSlice";
import { useThemeColor } from "@/hooks/useThemeColor";
import api from "@/utils/api";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ScriptureCardProps {
  scriptures: Scripture[];
  style?: ViewStyle;
}

function filterScriptures(scriptures: Scripture[]) {
  const isToday = (dateString: string | undefined) => {
    if (!dateString) return false;

    const date = new Date(dateString); // UTC ISO timestamp → local time
    const now = new Date(); // local time

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const todaysVerses = scriptures.filter((s) => isToday(s.createdAt));
  const previousVerses = scriptures.filter((s) => !isToday(s.createdAt));

  return { todaysVerses, previousVerses };
}

export function ScriptureItemCard({ scriptures, style }: ScriptureCardProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [popoverVisible, setPopoverVisible] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const navigation = useRouter();
  const optionBtnRefs = useRef<Record<number, any>>({});

  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web" && width >= 1024;

  const { reload } = useReduxScripture();

  // Use the filterScriptures function
  const { todaysVerses, previousVerses } = filterScriptures(scriptures);

  const grouped = [
    { label: "Today's Verses", key: "today", data: todaysVerses },
    { label: "Previous Verses", key: "previous", data: previousVerses },
  ];

  // Only allow one today's verse
  const canRepost = todaysVerses.length === 0;

  // Handlers
  const handleEdit = (scripture: Scripture) => {
    setPopoverVisible(null);
    navigation.push({
      pathname: "/post-scripture",
      params: {
        id: scripture.id,
        book: scripture.book,
        verse: scripture.verse,
        version: scripture.version,
        scripture: scripture.scripture,
      },
    });
  };

  const handleDelete = async (scripture: Scripture) => {
    setPopoverVisible(null);
    Alert.alert(
      "Delete Scripture",
      "Are you sure you want to delete this scripture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/scriptures/${scripture.id}`);
              Alert.alert("Deleted", "Scripture deleted successfully.");
              // Optionally trigger a reload in parent
              await reload();
            } catch {
              Alert.alert("Error", "Failed to delete scripture.");
            }
          },
        },
      ]
    );
  };

  const handleRepost = async (scripture: Scripture) => {
    setPopoverVisible(null);
    if (!canRepost) {
      Alert.alert("Error", "There can only be one Today's verse.");
      return;
    }
    try {
      await api.put(`/scriptures/${scripture.id}`, {
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Reposted", "Scripture moved to Today's Verses.");
      await reload();
    } catch {
      Alert.alert("Error", "Failed to repost scripture.");
    }
  };

  const POPOVER_WIDTH = 180;

  const showPopover = (houseId: number) => {
    const ref = optionBtnRefs.current[houseId];
    if (ref?.measure) {
      // Native path (optional fallback if running on native)
      const screenWidth = Dimensions.get("window").width;
      ref.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          let left = pageX;
          const verticalOffset = isWeb ? 10 : -40;
          if (left + POPOVER_WIDTH > screenWidth) {
            left = screenWidth - POPOVER_WIDTH - 20;
          }
          setPopoverPosition({ top: pageY + height + verticalOffset, left });
          setPopoverVisible(houseId);
        }
      );
    } else if (ref?.getBoundingClientRect) {
      // Web path
      const rect = ref.getBoundingClientRect();
      let left = rect.left;
      const verticalOffset = -45;
      if (left + POPOVER_WIDTH > window.innerWidth) {
        left = window.innerWidth - POPOVER_WIDTH - 20;
      }
      setPopoverPosition({
        top: rect.top + rect.height + verticalOffset,
        left,
      });
      setPopoverVisible(houseId);
    } else {
      setPopoverVisible(houseId);
    }
  };

  return (
    <>
      {grouped.map((group) => {
        if (!group.data || group.data.length === 0) return null;
        const showViewAll = group.data.length > 4;
        const isExpanded = expanded[group.key] || false;
        const displayed =
          showViewAll && !isExpanded ? group.data.slice(0, 4) : group.data;

        return (
          <ThemedView style={[styles.container, style]} key={group.key}>
            <ThemedView style={[styles.row, { marginBottom: 15 }]}>
              <ThemedText type="subtitle">{group.label}</ThemedText>
              {showViewAll && (
                <Pressable
                  onPress={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [group.key]: !prev[group.key],
                    }))
                  }
                >
                  <ThemedText type="default">
                    {isExpanded ? "View Less" : "View All"}
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>

            <ThemedView style={styles.verseButtons}>
              {displayed.map((verse, idx) => (
                <ThemedView
                  key={idx}
                  style={[styles.button, { backgroundColor: bgColor }]}
                >
                  <Image
                    source={require("@/assets/icons/sun.png")}
                    style={{ height: 35, width: 35, marginTop: 2 }}
                  />
                  <View style={styles.verseInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.verseTitle}
                      numberOfLines={1}
                    >
                      {verse.book} {verse.verse} ({verse.version})
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={styles.scriptureText}
                      numberOfLines={3}
                    >
                      {verse.scripture}
                    </ThemedText>
                  </View>
                  <Pressable
                    ref={(ref) => {
                      optionBtnRefs.current[verse.id] = ref;
                    }}
                    style={styles.optionBtn}
                    onPress={() => showPopover(verse.id)}
                  >
                    <Image
                      source={require("@/assets/icons/options.png")}
                      style={{ width: 24, height: 24, tintColor: textColor }}
                    />
                  </Pressable>
                  {/* Popover */}
                  <Modal
                    visible={popoverVisible === verse.id}
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
                            shadowColor: "#222",
                          },
                        ]}
                      >
                        <Pressable
                          style={styles.popoverButton}
                          onPress={() => handleEdit(verse)}
                        >
                          <ThemedText type="default">Edit</ThemedText>
                        </Pressable>
                        {group.key !== "today" && (
                          <Pressable
                            style={styles.popoverButton}
                            onPress={() => handleRepost(verse)}
                          >
                            <ThemedText type="default">Repost</ThemedText>
                          </Pressable>
                        )}
                        <Pressable
                          style={styles.popoverButton}
                          onPress={() => handleDelete(verse)}
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
      })}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: "10%",
    width: "100%",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  verseButtons: {
    gap: 8,
  },
  button: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 80,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
    position: "relative",
    width: "100%",
  },
  verseInfo: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 10,
    marginRight: 40,
  },
  verseTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  scriptureText: {
    fontSize: 16,
    color: "#666",
    flexWrap: "wrap",
  },
  popover: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 180,
    elevation: 2,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 2 },
    zIndex: 1000,
  },
  popoverButton: {
    // borderWidth: 1,
    marginVertical: 5,
  },
  optionBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
});
