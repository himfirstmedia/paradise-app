import { ScriptureItemCard } from "@/components/ScriptureItemCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReduxScripture } from "@/hooks/useReduxScripture";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";

import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

export default function ScripturesManagerScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { width } = useWindowDimensions();

  const isLargeScreen = Platform.OS === "web" && width >= 1024;
  const isMediumScreen = Platform.OS === "web" && width >= 768;

  const navigation = useRouter();
  const { scriptures, loading } = useReduxScripture();

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
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: "100%",
            paddingBottom: "30%",
          }}
          style={[styles.innerContainer]}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: "5%" }}
            />
          ) : scriptures.length === 0 ? (
            <ThemedText
              type="default"
              style={{
                textAlign: "center",
                marginTop: 24,
                color: "#888",
              }}
            >
              There are no scriptures added yet.
            </ThemedText>
          ) : (
            <ScriptureItemCard scriptures={scriptures} />
          )}
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
    bottom: "5%",
    right: "5%",
  },
  icon: {
    height: 25,
    width: 25,
    tintColor: "#FFFFFF",
  },
});
