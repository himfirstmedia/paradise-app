import { useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TaskCard, ProgressType } from "@/components/TaskCard";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function MemberDetailScreen() {
  const params = useLocalSearchParams();
  const bgColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "selection");

  // Extract member details from params
  const { name, house, team, phone, email, startDate, endDate, tasks } = params;

  // Parse tasks if present
  let parsedTasks: { name: string; description?: string; progress: string }[] =
    [];
  if (tasks) {
    try {
      parsedTasks = JSON.parse(tasks as string);
    } catch {
      parsedTasks = [];
    }
  }

  // Map parsedTasks to include onPress for TaskCard and cast progress to ProgressType
  const tasksWithOnPress = parsedTasks.map((task) => ({
    ...task,
    description: task.description ?? "",
    progress: task.progress as ProgressType,
    onPress: () => {},
  }));

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "flex-start",
          width: "100%",
          paddingBottom: "30%",
          justifyContent: "flex-start"
        }}
        style={[styles.innerContainer,{backgroundColor: bgColor}]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ marginBottom: "5%" }}>
          {name}
        </ThemedText>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">House:</ThemedText>
          <ThemedText type="default">{house}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Member:</ThemedText>
          <ThemedText type="default">{team}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Phone:</ThemedText>
          <ThemedText type="default">{phone}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Email:</ThemedText>
          <ThemedText type="default">{email}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">Start Date:</ThemedText>
          <ThemedText type="default">{startDate}</ThemedText>
        </View>
        <View style={styles.row}>
          <ThemedText type="defaultSemiBold">End Date:</ThemedText>
          <ThemedText type="default">{endDate}</ThemedText>
        </View>

        {tasksWithOnPress.length === 0 ? (
          <ThemedText type="default">No tasks found.</ThemedText>
        ) : (
          <View style={{ marginTop: "5%", width: "100%" }}>
            <TaskCard tasks={tasksWithOnPress} />
          </View>
        )}
      </ScrollView>

      <Pressable style={[styles.floatingBtn, {backgroundColor: primaryColor}]}>
        <Image source={require("@/assets/icons/home.png")} style={[styles.icon, {tintColor: "#FFFFFF"}]}/>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 8,
    
  },
  taskItem: {
    marginLeft: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  innerContainer: {
    flexGrow: 1,
    paddingVertical: "8%",
    width: "100%",
    
  },
  icon: {
    height: 30,
    width: 30
  },
  floatingBtn: {
    position: "absolute",
    bottom: 10,
    right: 15,
    height: 60, 
    width: 60, 
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center"
  }
});
