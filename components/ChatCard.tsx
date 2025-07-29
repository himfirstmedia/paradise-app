import { Pressable, StyleSheet, View } from "react-native";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserAvatar } from "./ui/UserAvatar";
import { ThemedText } from "./ThemedText";
import { useRouter } from "expo-router";
import { Chat } from "@/types/chat";
import { formatTime } from "@/utils/Formatters";

interface ChatCardProps {
  chat: Chat;
}

export function ChatCard({ chat }: ChatCardProps) {
  const bgColor = useThemeColor({}, "input");
  // const textColor = useThemeColor({}, "text");
  const navigation = useRouter();

  const lastMessage = chat.messages[0];
  const lastMessageTime = lastMessage?.createdAt || chat.updatedAt;
  const lastSenderName = lastMessage?.sender?.name || "Someone";

  // Assuming individual chat with only 2 users and current user is known
  const otherUser =
    chat.users.find((cu) => cu.user.role !== "RESIDENT")?.user ||
    chat.users[0]?.user;

  return (
    <Pressable
      style={{ width: "100%" }}
      onPress={() => navigation.push({ pathname: "/chat-room", params: { id: chat.id } })}
    >
      <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.row}>
          <UserAvatar size={60} user={otherUser} />
          <View style={styles.column}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <ThemedText type="subtitle">
                {otherUser?.name || "Direct Chat"}
              </ThemedText>
              <ThemedText type="default">
                {formatTime(lastMessageTime)}
              </ThemedText>
            </View>
            <ThemedText type="default" numberOfLines={1}>
              <ThemedText type="default" style={{ fontWeight: "bold" }}>
                {lastSenderName}:{" "}
              </ThemedText>
              {lastMessage?.content || "No messages yet"}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    width: "100%",
    borderRadius: 20,
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
});
