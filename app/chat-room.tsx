import { useState, useEffect, useRef, useCallback } from "react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { ThemedChatInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Message, CreateChatPayload } from "@/types/chat";
import { formatTime } from "@/utils/Formatters";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useReduxHouse } from "@/hooks/useReduxHouse";

export default function ChatRoomScreen() {
  const params = useLocalSearchParams();
  const { user } = useReduxAuth();
  const {
    chats,
    currentChat,
    setActiveChat,
    sendNewMessage,
    createNewChat,
    loading: chatLoading,
  } = useReduxChats();

  const { houses } = useReduxHouse();

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Add logs for debugging
  useEffect(() => {
    console.log("params:", params);
    console.log("user:", user);
    console.log("houses:", houses);
    console.log("currentChat:", currentChat);
    console.log("chatLoading:", chatLoading);
    console.log("isCreatingChat:", isCreatingChat);
  }, [params, user, houses, currentChat, chatLoading, isCreatingChat]);

  function getHouseById(id: number) {
    return houses.find((h) => h.id === id) || null;
  }

  const canSendMessage =
    user?.role === "RESIDENT_MANAGER" || user?.role === "FACILITY_MANAGER";

  const initializeChat = useCallback(async () => {
    console.log("initializeChat called");

    // Skip if initialization already attempted or current chat exists
    if (initializationAttempted || currentChat) {
      console.log("initializeChat skipped: already attempted or chat exists");
      return;
    }

    if (params.memberIds || params.houseIds) {
      setIsCreatingChat(true);
      setInitializationAttempted(true);

      try {
        const memberIds = params.memberIds
          ? params.memberIds.toString().split(",").map(Number)
          : [];
        const houseIds = params.houseIds
          ? params.houseIds.toString().split(",").map(Number)
          : [];
        console.log("memberIds:", memberIds);
        console.log("houseIds:", houseIds);

        const houseUserIds = houses
          .filter((house) => houseIds.includes(house.id))
          .flatMap((house) => house.users?.map((user) => user.id) || []);
        console.log("houseUserIds:", houseUserIds);

        const allParticipantIds = [
          user?.id || -1,
          ...memberIds,
          ...houseUserIds,
        ].filter((id, index, self) => id > 0 && self.indexOf(id) === index);
        console.log("allParticipantIds:", allParticipantIds);

        // Check if chat already exists in Redux store
        const existingChat = chats.find((chat) => {
          const chatUserIds = chat.users?.map((u) => u.user.id) || [];
          return (
            chat.houseId === houseIds[0] &&
            chatUserIds.length === allParticipantIds.length &&
            chatUserIds.every((id) => allParticipantIds.includes(id))
          );
        });

        if (existingChat) {
          console.log("Using existing chat:", existingChat);
          setActiveChat(existingChat);
          return;
        }

        const payload: CreateChatPayload = {
          participantIds: allParticipantIds,
          houseIds,
          isGroup: houseIds.length > 0 || memberIds.length > 1,
        };
        console.log("createNewChat payload:", payload);

        const newChat = await createNewChat(payload);
        console.log("newChat returned:", newChat);
      } catch (error) {
        console.error("Chat initialization failed:", error);
        setInitializationAttempted(false); // Allow retry
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      console.log("initializeChat skipped: no params");
    }
  }, [
    params.memberIds,
    params.houseIds,
    user?.id,
    createNewChat,
    currentChat,
    houses,
    setActiveChat,
    chats,
    initializationAttempted,
  ]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setInitializationAttempted(false);
      };
    }, [])
  );

  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [currentChat]);

  const handleSubmit = async () => {
    if (!inputText.trim() || !user || !currentChat?.id) return;

    setIsSending(true);
    try {
      await sendNewMessage({
        content: inputText.trim(),
        senderId: user.id,
        chatId: currentChat.id,
      });
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const getChatName = () => {
    if (currentChat?.name) return currentChat.name;
    if (currentChat?.users && currentChat.users.length === 2) {
      const otherUser = currentChat.users
        .map((u) => u.user)
        .find((u) => u.id !== user?.id);
      if (otherUser) return otherUser.name;
    }
    if (currentChat?.isGroup) {
      if (currentChat.houseId) {
        const house = getHouseById(currentChat.houseId);
        if (house) return house.name;
      }
      return "Group Chat";
    }
    return "New Chat";
  };

  if (chatLoading || isCreatingChat) {
    console.log("Loading or creating chat...");
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Creating chat...</ThemedText>
      </ThemedView>
    );
  }

  if (!currentChat && !isCreatingChat) {
    console.log("Chat not found, showing Try Again button");
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Chat not found</ThemedText>
        <Button
          title="Try Again"
          onPress={() => {
            setActiveChat(null);
            initializeChat();
          }}
        />
      </ThemedView>
    );
  }

  return (
    <>
      <SimpleHeader title={getChatName()} />
      <ThemedView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            alignItems: "flex-start",
            width: "100%",
            flexGrow: 1,
          }}
          style={styles.innerContainer}
        >
          {!currentChat?.messages || currentChat.messages.length === 0 ? (
            <ThemedText type="default" style={styles.noMessagesText}>
              No messages yet. Start the conversation!
            </ThemedText>
          ) : (
            currentChat.messages.map((message) => (
              <MessageBubble
                key={`${message.id}-${message.createdAt}`}
                message={message}
                isCurrentUser={message.sender.id === user?.id}
              />
            ))
          )}
        </ScrollView>

        {canSendMessage && (
          <View style={styles.ctaContainer}>
            <View style={{ flex: 1 }}>
              <ThemedChatInput
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Button
              type="icon-default"
              icon={require("@/assets/icons/send.png")}
              onPress={handleSubmit}
              disabled={isSending || !inputText.trim()}
              loading={isSending}
            />
          </View>
        )}
      </ThemedView>
    </>
  );
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const bgColor = useThemeColor({}, "input");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");

  if (!message.sender) {
    return null;
  }

  return (
    <ThemedView
      style={[
        styles.messageBubble,
        {
          backgroundColor: isCurrentUser ? tintColor : bgColor,
          alignSelf: isCurrentUser ? "flex-end" : "flex-start",
          borderTopLeftRadius: isCurrentUser ? 12 : 4,
          borderTopRightRadius: isCurrentUser ? 4 : 12,
        },
      ]}
    >
      {!isCurrentUser && (
        <View style={styles.senderInfo}>
          <UserAvatar size={30} user={message.sender} />
          <ThemedText type="defaultSemiBold" style={styles.senderName}>
            {message.sender.name}
          </ThemedText>
        </View>
      )}

      <ThemedText type="default" style={styles.messageText}>
        {message.content}
      </ThemedText>

      <View
        style={[
          styles.messageMeta,
          {
            justifyContent: isCurrentUser ? "flex-end" : "flex-start",
            marginTop: 4,
          },
        ]}
      >
        <ThemedText
          type="default"
          style={{ fontSize: 12, color: placeholderColor }}
        >
          {formatTime(message.createdAt)}
        </ThemedText>

        {isCurrentUser && (
          <Image
            source={require("@/assets/icons/check.png")}
            style={[
              styles.icon,
              {
                tintColor:
                  message.readBy && message.readBy.length > 1
                    ? "#4CAF50"
                    : textColor,
                marginLeft: 6,
              },
            ]}
          />
        )}
      </View>
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
    paddingVertical: 20,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  senderName: {
    fontSize: 14,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    height: 14,
    width: 14,
  },
  noMessagesText: {
    textAlign: "center",
    width: "100%",
    marginTop: 20,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
