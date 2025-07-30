import { useState, useEffect, useRef, useCallback } from "react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { ThemedChatInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/Button";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Message, CreateChatPayload, Chat } from "@/types/chat";
import { formatTime } from "@/utils/Formatters";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useReduxHouse } from "@/hooks/useReduxHouse";

export default function ChatRoomScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const userHouse = houses.find(house =>
  house.users?.some(u => u.id === user?.id)
);

const userHouseId = userHouse?.id;



  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  function getHouseById(id: number) {
    return houses.find((h) => h.id === id) || null;
  }

  const canSendMessage =
    user?.role === "RESIDENT_MANAGER" || user?.role === "FACILITY_MANAGER";

  const findTargetChat = useCallback(() => {
  if (!userHouseId) return null;

  const houseChats = chats.filter((chat: Chat) =>
    chat.houseId !== undefined && chat.houseId === userHouseId
  );

  const houseUserIds = userHouse?.users?.map(user => user.id) || [];

  const allParticipantIds = [user?.id || -1, ...houseUserIds].filter(
    (id, index, self) => id > 0 && self.indexOf(id) === index
  );

  return houseChats.find((chat) => {
    const chatUserIds = chat.users?.map((u) => u.user.id) || [];
    return (
      chatUserIds.length === allParticipantIds.length &&
      chatUserIds.every((id) => allParticipantIds.includes(id))
    );
  });
}, [userHouseId, userHouse, user?.id, chats]);


  const initializeChat = useCallback(async () => {
    console.log("initializeChat called");

    if (initializationAttempted || currentChat) return;

    if (userHouseId) {

      setIsCreatingChat(true);
      setInitializationAttempted(true);

      try {
        const existingChat = findTargetChat();
        if (existingChat) {
          setActiveChat(existingChat);
          return;
        }

        const targetHouseId = userHouseId;


        // FIX 4: Only include house users (no memberIds)
        const targetHouse = houses.find((house) => house.id === targetHouseId);
        const houseUserIds = targetHouse?.users?.map((user) => user.id) || [];

        const allParticipantIds = [user?.id || -1, ...houseUserIds].filter(
          (id, index, self) => id > 0 && self.indexOf(id) === index
        );

        const payload: CreateChatPayload = {
          participantIds: allParticipantIds,
          houseIds: [targetHouseId],
          isGroup: true,
        };

        const newChat = await createNewChat(payload);
        console.log("newChat returned:", newChat);

        // If createNewChat returns the chat, set it as active
        if (newChat) {
          setActiveChat(newChat);
        } else {
          // If not, try to find it in the global state
          const createdChat = findTargetChat();
          if (createdChat) {
            setActiveChat(createdChat);
          }
        }
      } catch (error) {
        console.error("Chat initialization failed:", error);
        setInitializationAttempted(false);
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      console.log("initializeChat skipped: no params");
    }
  }, [
    user?.id,
    createNewChat,
    currentChat,
    houses,
    setActiveChat,
    initializationAttempted,
    findTargetChat,
    userHouseId
  ]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useEffect(() => {
    if (isCreatingChat && !currentChat) {
      const createdChat = findTargetChat();
      if (createdChat) {
        console.log("Found newly created chat in global state:", createdChat);
        setActiveChat(createdChat);
      }
    }
  }, [chats, isCreatingChat, currentChat, findTargetChat, setActiveChat]);

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
        image: "",
      });
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (uri: string) => {
    if (!user || !currentChat?.id || !uri) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: `chat-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      // Upload image to backend
      const uploadRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/uploads/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      console.log("Upload URL:", process.env.EXPO_PUBLIC_BASE_URL);

      const data = await uploadRes.json();

      if (!uploadRes.ok || !data.filename) {
        throw new Error("Image upload failed");
      }

      await sendNewMessage({
        content: "",
        senderId: user.id,
        chatId: currentChat.id,
        image: data.filename,
      });
    } catch (error) {
      console.error("Failed to send image:", error);
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

  // Combined loading state
  const isLoading =
    chatLoading || isCreatingChat || (initializationAttempted && !currentChat);

  if (isLoading) {
    console.log("Loading or creating chat...");
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText>Setting up chat...</ThemedText>
      </ThemedView>
    );
  }


  return (
    <>
      <SimpleHeader title={getChatName()} onBack={() => navigation.back()} />
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
                onSendImage={handleSendImage}
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

  if (!message.sender) return null;

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

      {message.image && (
        <Image
          source={{ uri: message.image }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 12,
            marginVertical: 8,
          }}
          resizeMode="cover"
        />
      )}

      {message.content?.trim().length > 0 && (
        <ThemedText type="default" style={styles.messageText}>
          {message.content}
        </ThemedText>
      )}

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
    gap: 16,
  },
});
