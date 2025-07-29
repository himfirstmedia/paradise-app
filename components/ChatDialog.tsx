import { StyleSheet, View, Image } from "react-native";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";

export function ChatDialog() {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");
  return (
    <>
      <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.row}>
          <View style={styles.column}>
            <ThemedText type="default">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea et
              tempore cumque, cupiditate quia quisquam magni rem repellendus
              atque itaque soluta sapiente eos laudantium laborum ipsam iste
              maxime animi minima?
            </ThemedText>
            <View style={[styles.row, { justifyContent: "flex-end", gap: 5 }]}>
              <ThemedText
                type="default"
                style={{ fontSize: 14, color: placeholderColor }}
              >
                11:58 AM
              </ThemedText>
              <Image
                source={require("@/assets/icons/check.png")}
                style={[styles.icon, { tintColor: textColor }]}
              />
            </View>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    // minHeight: 100,
    width: "85%",
    borderRadius: 10,
    borderTopLeftRadius: 0,
    justifyContent: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  column: {
    flexDirection: "column",
    flex: 1,
  },
  icon: {
    height: 18,
    width: 18,
  },
});
