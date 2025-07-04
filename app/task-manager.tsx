import { TaskCard } from "@/components/TaskCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxTasks } from "@/hooks/useReduxTasks";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function TaskManagerScreen() {
  const bgColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "selection");
  const { tasks, loading, reload } = useReduxTasks();
  const navigation = useRouter();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={primaryColor}
          style={{ marginTop: "5%" }}
        />
      ) : safeTasks.length === 0 ? (
        <ThemedText
          type="default"
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "#888",
          }}
        >
          There are no tasks available yet.
        </ThemedText>
      ) : (
        <ScrollView
          contentContainerStyle={{
            alignItems: "flex-start",
            width: "100%",
            paddingBottom: "30%",
          }}
          style={styles.innerContainer}
        >
          <TaskCard tasks={safeTasks} />
        </ScrollView>
      )}
      <Pressable
        style={[styles.taskCTAbtn, { backgroundColor: primaryColor }]}
        onPress={() => {
          navigation.push("/add-task");
        }}
      >
        <Image source={require("@/assets/icons/add.png")} style={styles.icon} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
  },
  taskCTAbtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: "5%",
    right: "5%",
  },
  icon: {
    height: 25,
    width: 25,
    tintColor: "#FFFFFF",
  },
});
