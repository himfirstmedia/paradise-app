import { FeedbackCard } from "@/components/FeedbackCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxFeedback } from "@/hooks/useReduxFeedback";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function CommentsManagerScreen() {
  const { feedbacks, loading, reload } = useReduxFeedback();
  const primaryColor = useThemeColor({}, "selection");

  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

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
    <>
      <ThemedView style={[styles.container, responsiveStyles.containerPadding]}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={primaryColor}
            style={{ marginTop: "5%" }}
          />
        ) : feedbacks.length === 0 ? (
          <ThemedText
            type="default"
            style={{
              textAlign: "center",
              marginTop: 24,
              color: "#888",
            }}
          >
            There are no Comments / Suggestions yet.
          </ThemedText>
        ) : (
          <FeedbackCard feedbacks={feedbacks} />
        )}
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
});
