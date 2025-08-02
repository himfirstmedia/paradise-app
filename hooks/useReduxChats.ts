import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectCurrentUser } from "@/redux/slices/authSlice";
import {
  loadChats,
  createChat,
  sendMessage,
  getChat,
  getMessages,
  setCurrentChat,
} from "@/redux/slices/chatSlice";
import { Chat, CreateChatPayload, SendMessagePayload } from "@/types/chat";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

export function useReduxChats() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { chats, chatsStatus, error, currentChat } = useAppSelector(
    (state) => state.chat
  ) as { chats: (Chat | null | undefined)[]; chatsStatus: string; error: string | null; currentChat: Chat | null };

  const validChats = chats.filter(
    (chat): chat is Chat => chat !== null && chat !== undefined && typeof chat === "object" && !!chat.id
  );

  const currentUser = useAppSelector(selectCurrentUser);
  const lastNotificationChatId = useRef<number | null>(null);
  const lastFetchMessages = useRef<number | null>(null);
  const lastFetchChats = useRef<number | null>(null);

  const reloadChats = useCallback(() => {
    const now = Date.now();
    if (lastFetchChats.current && now - lastFetchChats.current < 10000) {
      console.log("Throttling reloadChats for userId:", currentUser?.id);
      return;
    }
    lastFetchChats.current = now;
    if (currentUser?.id) {
      console.log("Reloading chats for userId:", currentUser.id);
      dispatch(loadChats(currentUser.id));
    } else {
      console.warn("No current user ID, skipping reloadChats");
    }
  }, [dispatch, currentUser]);

  const createNewChat = useCallback(
    async (payload: CreateChatPayload) => {
      try {
        const result = await dispatch(createChat(payload));
        if (createChat.fulfilled.match(result)) {
          const chat = result.payload;
          dispatch(setCurrentChat(chat));
          dispatch(getMessages(chat.id));
          return chat;
        } else {
          console.error("Failed to create chat:", result.error);
          Alert.alert("Error", `Failed to create chat: ${result.error.message || "Unknown error"}`);
          return null;
        }
      } catch (error: any) {
        console.error("Error creating chat:", error.message);
        Alert.alert("Error", `Failed to create chat: ${error.message}`);
        return null;
      }
    },
    [dispatch]
  );

  const sendNewMessage = useCallback(
    async (payload: SendMessagePayload) => {
      if (!currentUser || !payload.chatId) {
        console.error("Missing current user or chat ID");
        return { error: "Missing current user or chat ID" };
      }
      const fullPayload: SendMessagePayload = {
        ...payload,
        senderId: currentUser.id,
      };
      try {
        const result = await dispatch(sendMessage(fullPayload));
        if (sendMessage.fulfilled.match(result)) {
          dispatch(getMessages(payload.chatId));
          return result.payload;
        } else {
          console.error("Message send failed:", result.error);
          return { error: result.error.message };
        }
      } catch (error: any) {
        console.error("Message send failed:", error.message);
        return { error: error.message };
      }
    },
    [dispatch, currentUser]
  );

  const fetchChat = useCallback(
    async (chatId: number) => {
      return await dispatch(getChat(chatId)).unwrap();
    },
    [dispatch]
  );

  const fetchMessages = useCallback(
    (chatId: number) => {
      const now = Date.now();
      if (lastFetchMessages.current && now - lastFetchMessages.current < 10000) {
        console.log("Throttling fetchMessages for chatId:", chatId);
        return;
      }
      lastFetchMessages.current = now;
      dispatch(getMessages(chatId));
    },
    [dispatch]
  );

  const setActiveChat = useCallback(
    (chat: Chat | null) => {
      dispatch(setCurrentChat(chat));
      if (chat?.id) {
        fetchMessages(chat.id);
      }
    },
    [dispatch, fetchMessages]
  );

  const reloadCurrentChatMessages = useCallback(() => {
    if (currentChat?.id) {
      fetchMessages(currentChat.id);
    } else {
      console.warn("No current chat ID, skipping reloadCurrentChatMessages");
    }
  }, [currentChat?.id, fetchMessages]);

  useEffect(() => {
    if (chatsStatus === "idle" && currentUser?.id) {
      reloadChats();
    }
  }, [chatsStatus, currentUser, reloadChats]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const notificationData = notification.request.content.data;
        console.log("Notification received:", notificationData);
        const chatId = Number(notificationData?.chatId);
        if (!chatId || isNaN(chatId)) {
          console.warn("Invalid chatId in notification:", notificationData);
          return;
        }
        if (lastNotificationChatId.current === chatId) {
          console.log("Skipping duplicate notification for chatId:", chatId);
          return;
        }
        lastNotificationChatId.current = chatId;
        reloadChats();
        if (currentChat?.id === chatId) {
          reloadCurrentChatMessages();
        } else {
          const chat = await dispatch(getChat(chatId)).unwrap();
          if (chat?.houseId) {
            router.push({
              pathname: "/chat-room",
              params: { chatId: chatId.toString(), houseId: chat.houseId.toString() },
            });
          }
        }
      }
    );
    return () => notificationListener.remove();
  }, [reloadChats, reloadCurrentChatMessages, currentChat, dispatch, router]);

  return {
    chats: validChats,
    currentChat,
    chatsStatus,
    error,
    loading: chatsStatus === "loading",
    reloadChats,
    createNewChat,
    sendNewMessage,
    fetchChat,
    fetchMessages,
    setActiveChat,
    reloadCurrentChatMessages,
  };
}