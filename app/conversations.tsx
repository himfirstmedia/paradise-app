import { ChatCard } from "@/components/ChatCard";
import { GroupChatCard } from "@/components/GroupChatCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, ScrollView, View, ActivityIndicator } from "react-native";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function ConversationsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { user } = useReduxAuth();
  const role = user?.role;
  const router = useRouter();

  const isManager = role === "FACILITY_MANAGER" || role === "RESIDENT_MANAGER";

  const { chats, loading } = useReduxChats();

  const filteredChats = chats.filter((chat) =>
    isManager ? chat.isGroup : !chat.isGroup
  );

  const handleStartNewMessage = () => {
    router.push("/new-message");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.innerContainer}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={primaryColor}
            style={{ marginTop: "5%" }}
          />
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) =>
            chat.isGroup ? (
              <GroupChatCard key={chat.id} chat={chat} />
            ) : (
              <ChatCard key={chat.id} chat={chat} />
            )
          )
        ) : (
          <View style={styles.noChatsWrapper}>
            <ThemedText type="default" style={{ marginBottom: 10 }}>
              No new messages
            </ThemedText>

            {isManager && (
              <ThemedView style={styles.ctaButton}>
                <Button
                  type="icon-default"
                  icon={require("@/assets/icons/message.png")}
                  onPress={handleStartNewMessage}
                  iconStyle={{ height: 32, width: 32 }}
                  style={{ height: 60, width: 60 }}
                />
              </ThemedView>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  scrollContent: {
    alignItems: "flex-start",
    width: "100%",
    flexGrow: 1,
  },
  noChatsWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },

  ctaButton: {
    position: "absolute",
    bottom: "5%",
    right: 15,
  },
});
