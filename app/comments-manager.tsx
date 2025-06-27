// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FeedbackCard } from "@/components/FeedbackCard";
import { ThemedView } from "@/components/ThemedView";
import { useReduxFeedback } from "@/hooks/useReduxFeedback";
import { StyleSheet } from "react-native";



export default function CommentsManagerScreen() {
    const { feedbacks, loading } = useReduxFeedback();
    
  return (
    <>
      <ThemedView style={styles.container}>

        {!loading && <FeedbackCard feedbacks={feedbacks} />}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
});
