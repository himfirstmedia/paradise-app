import { Image, Pressable, StyleSheet, View } from "react-native";
import { ThemedView } from "./ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserAvatar } from "./ui/UserAvatar";
import { ThemedText } from "./ThemedText";
import { useRouter } from "expo-router";
import { Chat } from "@/types/chat";
import { formatTime } from "@/utils/Formatters";

interface GroupChatCardProps {
  chat: Chat;
}

export function GroupChatCard({ chat }: GroupChatCardProps) {
  const bgColor = useThemeColor({}, "input");
  const textColor = useThemeColor({}, "text");
  const navigation = useRouter();

  const lastMessage = chat.messages?.[0];
  const lastMessageTime = lastMessage?.createdAt || chat.updatedAt;
  const lastSenderName = lastMessage?.sender?.name;

  console.log("Message: ", lastMessage);
  

  return (
    <Pressable
      style={{ width: "100%" }}
      onPress={() => {
        navigation.push({ pathname: "/chat-room", params: { id: chat.id } });
      }}
    >
      <ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.row}>
          <UserAvatar
            size={60}
            user={{ name: chat.name || null || undefined }}
          />
          <View style={styles.column}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <ThemedText type="subtitle">{chat.name}</ThemedText>
              <ThemedText type="default">
                {formatTime(lastMessageTime)}
              </ThemedText>
            </View>

            {lastMessage ? (
              <View
                style={[styles.row, { gap: 5, justifyContent: "flex-start" }]}
              >
                <Image
                  source={require("@/assets/icons/check.png")}
                  style={[styles.sentIcon, { tintColor: textColor }]}
                />
                <ThemedText
                  type="default"
                  numberOfLines={1}
                  style={{ width: "70%" }}
                >
                  <ThemedText type="default" style={{ fontWeight: "bold" }}>
                    {lastSenderName}:{" "}
                  </ThemedText>
                  {lastMessage.content && lastMessage.content.trim().length > 0
                    ? lastMessage.content
                    : lastMessage.image
                      ? "Image"
                      : ""}
                </ThemedText>
              </View>
            ) : (
              <ThemedText type="default" style={{ fontStyle: "italic" }}>
                No messages yet
              </ThemedText>
            )}
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
  sentIcon: {
    height: 15,
    width: 15,
  },
});
