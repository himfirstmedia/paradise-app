import { ChatCard } from "@/components/ChatCard";
import { GroupChatCard } from "@/components/GroupChatCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, ScrollView, View, ActivityIndicator } from "react-native";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useRouter, useFocusEffect } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCallback } from "react";

export default function ConversationsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { user } = useReduxAuth();
  const role = user?.role;
  const router = useRouter();

  const isManager = role === "FACILITY_MANAGER" || role === "RESIDENT_MANAGER";

  const { chats, loading, reloadChats } = useReduxChats();

  console.log("Chats: ", chats);

  useFocusEffect(
  useCallback(() => {
    reloadChats();
  }, [reloadChats])
);

  const filteredChats = chats.filter((chat) => {
  if (isManager) return true;  
  
  const userHouseIds = user?.house ? [user.house.id] : [];
  const inUserHouses = chat.houseId && userHouseIds.includes(chat.houseId);
  
  return !chat.isGroup || (chat.isGroup && inUserHouses);
});


  const handleStartNewMessage = () => {
    router.push("/new-message");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          filteredChats.length > 0 && styles.scrollContentWithChats
        ]}
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
          </View>
        )}
      </ScrollView>

      {isManager && (
        <View style={styles.floatingButton}>
          <Button
            type="icon-default"
            icon={require("@/assets/icons/message.png")}
            onPress={handleStartNewMessage}
            iconStyle={{ height: 32, width: 32 }}
            style={{ height: 60, width: 60 }}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
    position: 'relative', 
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
  scrollContentWithChats: {
    paddingBottom: 80,
  },
  noChatsWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 30,
    width: "100%",
  },
  floatingButton: {
    position: 'absolute',
    bottom: "10%",
    right: 20,
    zIndex: 10, 
  },
});