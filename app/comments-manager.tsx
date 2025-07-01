import { FeedbackCard } from "@/components/FeedbackCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxFeedback } from "@/hooks/useReduxFeedback";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityIndicator, StyleSheet } from "react-native";

export default function CommentsManagerScreen() {
  const { feedbacks, loading } = useReduxFeedback();
  const primaryColor = useThemeColor({}, "selection");

  return (
    <>
      <ThemedView style={styles.container}>
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
