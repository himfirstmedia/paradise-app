import { ChatCard } from "@/components/ChatCard";
import { GroupChatCard } from "@/components/GroupChatCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useState } from "react";

export default function ConversationsScreen() {
  const primaryColor = useThemeColor({}, "selection");
  const { user } = useReduxAuth();
  const role = user?.role;
  const router = useRouter();

  const isManager = role === "FACILITY_MANAGER" || role === "RESIDENT_MANAGER";
  const [refreshing, setRefreshing] = useState(false);
  const { chats, loading, reloadChats } = useReduxChats();

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadChats();
    setRefreshing(false);
  };

  console.log("Chats before filtering: ", chats);
  const filteredChats = chats.filter((chat) => {
    if (!chat || !chat.id) {
      console.warn("Invalid chat found:", chat);
      return false;
    }
    if (isManager) return true;
    const userHouseIds = user?.house ? [user.house.id] : [];
    const inUserHouses = chat.houseId && userHouseIds.includes(chat.houseId);
    return !chat.isGroup || (chat.isGroup && inUserHouses);
  });
  console.log("Filtered chats: ", filteredChats);

  const handleStartNewMessage = () => {
    router.push("/new-message");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor} // iOS
            colors={[primaryColor]} // Android
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          filteredChats.length > 0 && styles.scrollContentWithChats,
        ]}
        style={styles.innerContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: "5%" }}
            />
          </View>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) =>
            chat && chat.id ? (
              chat.isGroup ? (
                <GroupChatCard key={chat.id} chat={chat} />
              ) : (
                <ChatCard key={chat.id} chat={chat} />
              )
            ) : null
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
    position: "relative",
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
    position: "absolute",
    bottom: "5%",
    right: 20,
    zIndex: 10,
  },
});
