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
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Message, CreateChatPayload, User } from "@/types/chat";
import { formatTime } from "@/utils/Formatters";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReduxChats } from "@/hooks/useReduxChats";
import { useReduxHouse } from "@/hooks/useReduxHouse";
import type { House } from "@/redux/slices/houseSlice";

export default function ChatRoomScreen() {
  const navigation = useRouter();
  const primaryColor = useThemeColor({}, "selection");
  const params = useLocalSearchParams();
  const { user } = useReduxAuth();
  const {
    chats,
    currentChat,
    setActiveChat,
    sendNewMessage,
    createNewChat,
    fetchChat,
    fetchMessages,
    loading: chatLoading,
  } = useReduxChats();
  const { houses } = useReduxHouse();

  const userHouse = houses.find((house) =>
    house.users?.some((u) => u.id === user?.id)
  );
  const userHouseId = userHouse?.id;

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedHouseIds, setSelectedHouseIds] = useState<number[]>([]);
  const [hasFetchedMessages, setHasFetchedMessages] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  function getHouseById(id: number): House | null {
    return houses.find((h) => h.id === id) || null;
  }

  const canSendMessage =
    user?.role === "DIRECTOR" || user?.role === "MANAGER";


  useEffect(() => {
    if (params.houseIds) {
      const houseIds = String(params.houseIds)
        .split(",")
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));
      setSelectedHouseIds(houseIds);
      console.log("Selected houseIds from params:", houseIds);
    }
  }, [params.houseIds]);

  const findTargetChat = useCallback(() => {
    if (!userHouseId || selectedHouseIds.length === 0) return null;
    const houseChats = chats.filter(
      (chat) => chat.houseId !== undefined && selectedHouseIds.includes(chat.houseId)
    );
    const houseUserIds = userHouse?.users?.map((user) => user.id) || [];
    const allParticipantIds = [user?.id || -1, ...houseUserIds].filter(
      (id: number, index: number, self: number[]) =>
        id > 0 && self.indexOf(id) === index
    ).sort();
    return houseChats.find((chat) => {
      const chatUserIds = chat.users?.map((u: { user: User }) => u.user.id).sort() || [];
      return (
        chatUserIds.length === allParticipantIds.length &&
        JSON.stringify(chatUserIds) === JSON.stringify(allParticipantIds)
      );
    });
  }, [userHouseId, userHouse, user?.id, chats, selectedHouseIds]);

  const initializeChat = useCallback(async () => {
    if (!userHouseId) {
      console.warn("No userHouseId, skipping chat initialization");
      Alert.alert("Error", "No house assigned. Please contact support.");
      return;
    }

    // Check if chatId is provided in params
    const chatId = params.chatId ? Number(params.chatId) : null;
    if (chatId) {
      const existingChat = chats.find((chat) => chat.id === chatId);
      if (existingChat) {
        setActiveChat(existingChat);
        if (!hasFetchedMessages) {
          fetchMessages(chatId);
          setHasFetchedMessages(true);
        }
      } else {
        fetchChat(chatId);
      }
    } else {
      // Check for existing chat with selected houseIds
      const existingChat = findTargetChat();
      if (existingChat) {
        setActiveChat(existingChat);
        if (!hasFetchedMessages) {
          fetchMessages(existingChat.id);
          setHasFetchedMessages(true);
        }
      }
      // Defer chat creation to handleSubmit
    }
  }, [
    userHouseId,
    params.chatId,
    chats,
    setActiveChat,
    fetchChat,
    fetchMessages,
    findTargetChat,
    hasFetchedMessages,
  ]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveChat(null);
        setHasFetchedMessages(false); // Reset for next navigation
      };
    }, [setActiveChat])
  );

  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [currentChat?.messages]);

  const handleSendImage = async (imageUri: string) => {
    if (!user || !userHouseId) {
      Alert.alert("Error", "User or house not found.");
      setIsSending(false);
      return;
    }

    setIsSending(true);
    try {
      let chatId = currentChat?.id;
      if (!chatId) {
        if (selectedHouseIds.length === 0) {
          Alert.alert("Error", "No house selected.");
          setIsSending(false);
          return;
        }

        const targetHouse = houses.find((house) => house.id === userHouseId);
        if (!targetHouse) {
          Alert.alert("Error", "Selected house not found.");
          setIsSending(false);
          return;
        }

        const houseUserIds = targetHouse.users?.map((user) => user.id) || [];
        const allParticipantIds = [user.id, ...houseUserIds].filter(
          (id: number, index: number, self: number[]) =>
            id > 0 && self.indexOf(id) === index
        ).sort();
        if (allParticipantIds.length < 2) {
          Alert.alert("Error", "No valid participants found for the chat.");
          setIsSending(false);
          return;
        }

        const payload: CreateChatPayload = {
          participantIds: allParticipantIds,
          houseIds: selectedHouseIds,
          isGroup: true,
        };
        console.log("Creating chat for image with payload:", payload);

        const newChat = await createNewChat(payload);
        if (!newChat || !newChat.id) {
          console.warn("Failed to create new chat for image:", newChat);
          Alert.alert("Error", "Failed to create chat. Please try again.");
          setIsSending(false);
          return;
        }
        chatId = newChat.id;
      }

      const result = await sendNewMessage({
        content: "",
        senderId: user.id,
        chatId: chatId!,
        image: imageUri,
      });
      if (result?.error) {
        Alert.alert("Error", `Failed to send image: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Failed to send image:", error.message);
      Alert.alert("Error", `Failed to send image: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || !user) {
      Alert.alert("Error", "Please enter a message.");
      return;
    }

    setIsSending(true);
    try {
      let chatId = currentChat?.id;
      if (!chatId) {
        if (selectedHouseIds.length === 0 || !userHouseId) {
          Alert.alert("Error", "No house selected or user house not found.");
          setIsSending(false);
          return;
        }

        const targetHouse = houses.find((house) => house.id === userHouseId);
        if (!targetHouse) {
          Alert.alert("Error", "Selected house not found.");
          setIsSending(false);
          return;
        }

        const houseUserIds = targetHouse.users?.map((user) => user.id) || [];
        const allParticipantIds = [user.id, ...houseUserIds].filter(
          (id: number, index: number, self: number[]) =>
            id > 0 && self.indexOf(id) === index
        ).sort();
        if (allParticipantIds.length < 2) {
          Alert.alert("Error", "No valid participants found for the chat.");
          setIsSending(false);
          return;
        }

        const payload: CreateChatPayload = {
          participantIds: allParticipantIds,
          houseIds: selectedHouseIds,
          isGroup: true,
        };
        console.log("Creating chat with payload:", payload);

        const newChat = await createNewChat(payload);
        if (!newChat || !newChat.id) {
          console.warn("Failed to create new chat or chat lacks id:", newChat);
          Alert.alert("Error", "Failed to create chat. Please try again.");
          setIsSending(false);
          return;
        }
        chatId = newChat.id;
      }

      const result = await sendNewMessage({
        content: inputText.trim(),
        senderId: user.id,
        chatId: chatId!,
        image: "",
      });
      if (result?.error) {
        Alert.alert("Error", `Failed to send message: ${result.error}`);
      } else {
        setInputText("");
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error: any) {
      console.error("Failed to send message:", error.message);
      Alert.alert("Error", `Failed to send message: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getChatName = () => {
    if (!currentChat && selectedHouseIds.length > 0) {
      const house = getHouseById(selectedHouseIds[0]);
      return house ? house.name : "New Group Chat";
    }
    if (!currentChat) return "Loading Chat...";
    if (currentChat.name) return currentChat.name;
    if (currentChat.users && currentChat.users.length === 2) {
      const otherUser = currentChat.users
        .map((u: { user: User }) => u.user)
        .find((u: User) => u.id !== user?.id);
      if (otherUser) return otherUser.name;
    }
    if (currentChat.isGroup) {
      if (currentChat.houseId) {
        const house = getHouseById(currentChat.houseId);
        if (house) return house.name;
      }
      return "Group Chat";
    }
    return "New Chat";
  };

  const isLoading = chatLoading && !currentChat;

  return (
    <ThemedView style={styles.container}>
      <View style={{ width: "100%" }}>
        <SimpleHeader title={getChatName()} onBack={() => navigation.back()} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          style={styles.innerContainer}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primaryColor} />
            </ThemedView>
          ) : !currentChat?.messages || currentChat.messages.length === 0 ? (
            <ThemedText type="default" style={styles.noMessagesText}>
              No messages yet. Start the conversation!
            </ThemedText>
          ) : (
            currentChat.messages.map((message: Message) => (
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
      </KeyboardAvoidingView>
    </ThemedView>
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
        <ThemedText type="default" style={[styles.messageText, {color: "#fff"}]}>
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
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  scrollContent: {
    alignItems: "flex-start",
    width: "100%",
    flexGrow: 1,
    paddingBottom: 50,
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
  button: {
    margin: 10,
  },
});
