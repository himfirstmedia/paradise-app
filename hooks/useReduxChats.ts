import { useEffect, useCallback } from "react";
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
import {
  Chat,
  CreateChatPayload,
  SendMessagePayload,
} from "@/types/chat";

export function useReduxChats() {
  const dispatch = useAppDispatch();
  const { chats, chatsStatus, error, currentChat } = useAppSelector(
    (state) => state.chat
  );

  const currentUser = useAppSelector(selectCurrentUser);

  const reloadChats = useCallback(() => {
    if (currentUser?.id) {
      dispatch(loadChats(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const createNewChat = useCallback(
    async (payload: CreateChatPayload) => {
      const result = await dispatch(createChat(payload));

      if (createChat.fulfilled.match(result)) {
        const chat = result.payload;
        dispatch(setCurrentChat(chat));
        dispatch(getMessages(chat.id));
        return chat;
      }

      return null;
    },
    [dispatch]
  );

  const sendNewMessage = useCallback(async (payload: SendMessagePayload) => {
  if (!currentUser || !currentChat?.id) {
    console.error("Missing current user or chat ID");
    return;
  }
  
  const fullPayload: SendMessagePayload = {
    ...payload,
    chatId: currentChat.id,
    senderId: currentUser.id
  };

  try {
    await dispatch(sendMessage(fullPayload));
    dispatch(getMessages(currentChat.id));
  } catch (error) {
    console.error("Message send failed:", error);
  }
}, [dispatch, currentUser, currentChat]);


  const fetchChat = useCallback(
    (chatId: number) => {
      dispatch(getChat(chatId));
    },
    [dispatch]
  );

  const fetchMessages = useCallback(
    (chatId: number) => {
      dispatch(getMessages(chatId));
    },
    [dispatch]
  );

  const setActiveChat = useCallback(
    (chat: Chat | null) => {
      dispatch(setCurrentChat(chat));
    },
    [dispatch]
  );

  const reloadCurrentChatMessages = useCallback(() => {
    if (currentChat?.id) {
      dispatch(getMessages(currentChat.id));
    }
  }, [currentChat?.id, dispatch]);

  useEffect(() => {
    if (chatsStatus === "idle" && currentUser?.id) {
      reloadChats();
    }
  }, [chatsStatus, currentUser, reloadChats]);

  return {
    chats,
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
