import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Button } from "./ui/Button";
import { StyleSheet } from "react-native";

export function AlertDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const bgColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor, padding: 20, borderRadius: 15 }]}>
      <ThemedText style={{ color: textColor, fontSize: 18, fontWeight: "bold" }}>{title}</ThemedText>
      <ThemedText style={{ color: textColor, marginTop: 10 }}>{message}</ThemedText>
      <ThemedView style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
        <Button title="Cancel" onPress={onCancel} />
        <Button title="Confirm" onPress={onConfirm} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {},
});