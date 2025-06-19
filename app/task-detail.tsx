import { useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function TaskDetailScreen() {
  const params = useLocalSearchParams();
  const name = params.name as string;
  const description = params.description as string;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{name}</ThemedText>
      <ThemedText type="default">{description}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 16,
  },
});