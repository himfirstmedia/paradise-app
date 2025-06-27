import { ScriptureItemCard } from "@/components/ScriptureItemCard";
import { ThemedView } from "@/components/ThemedView";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

import { Image, Pressable, ScrollView, StyleSheet } from "react-native";

export default function ScripturesManagerScreen() {
  const primaryColor = useThemeColor({}, "selection");

  const navigation = useRouter();
  const { scriptures } = useReduxScripture();

  return (
    <>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "30%",
          }}
          style={[styles.innerContainer]}
        >
          <ScriptureItemCard scriptures={scriptures} />
        </ScrollView>
        <Pressable
          style={[styles.taskCTAbtn, { backgroundColor: primaryColor }]}
          onPress={() => {
            navigation.push("/post-scripture");
          }}
        >
          <Image
            source={require("@/assets/icons/add.png")}
            style={styles.icon}
          />
        </Pressable>
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
    bottom: "10%",
    right: "5%",
  },
  icon: {
    height: 25,
    width: 25,
    tintColor: "#FFFFFF",
  },
});
