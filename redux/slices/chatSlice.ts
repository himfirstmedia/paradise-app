// redux/slices/chatSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/utils/api';
import StorageParams from '@/constants/StorageParams';
import { Chat, CreateChatPayload, SendMessagePayload } from "@/types/chat"

interface ChatState {
  chats: Chat[];
  chatsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentChat: Chat | null;
}

const initialState: ChatState = {
  chats: [],
  chatsStatus: 'idle',
  error: null,
  currentChat: null,
};

// Load all chats for the current user
export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (userId: number, { rejectWithValue }) => {
    try {
      const cached = await AsyncStorage.getItem(StorageParams.CACHED_CHATS);
      const cachedParsed: Chat[] = cached ? JSON.parse(cached) : [];

      const res = await api.get(`/chats/user/${userId}`);
      const latest: Chat[] = res.data;

      if (JSON.stringify(cachedParsed) !== JSON.stringify(latest)) {
        await AsyncStorage.setItem(StorageParams.CACHED_CHATS, JSON.stringify(latest));
        return latest;
      }

      return cachedParsed;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load chats.');
    }
  }
);

// Create a new chat
export const createChat = createAsyncThunk(
  'chat/createChat',
  async (payload: CreateChatPayload, { rejectWithValue }) => {
    try {
      const response = await api.post('/chats', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat.');
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { chat: ChatState };
      const currentChat = state.chat.currentChat;
      
      if (!currentChat) {
        throw new Error('No active chat');
      }

      const response = await api.post('/chats/message', {
        ...payload,
        chatId: currentChat.id
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message.');
    }
  }
);

// Get a specific chat
export const getChat = createAsyncThunk(
  'chat/getChat',
  async (chatId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get chat.');
    }
  }
);

// Get messages for a chat
export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (chatId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      return {
        chatId,
        messages: response.data
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get messages.');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set the current active chat
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    
    // Clear chat state
    clearChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Load Chats
      .addCase(loadChats.pending, (state) => {
        state.chatsStatus = 'loading';
        state.error = null;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.chatsStatus = 'succeeded';
        state.chats = action.payload;
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.chatsStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // Create Chat
.addCase(createChat.pending, (state) => {
        state.chatsStatus = 'loading';
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chatsStatus = 'succeeded';
        // Prevent duplicate chat additions
        const exists = state.chats.some(c => c.id === action.payload.id);
        if (!exists) {
          state.chats = [action.payload, ...state.chats];
        }
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.chatsStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        // We're handling optimistic updates in reducers
        // This just ensures the request completed successfully
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Get Chat
      .addCase(getChat.pending, (state) => {
        state.chatsStatus = 'loading';
        state.error = null;
      })
    
      .addCase(getChat.rejected, (state, action) => {
        state.chatsStatus = 'failed';
        state.error = action.payload as string;
      })
      
      // Get Messages
      .addCase(getMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        
        if (state.currentChat?.id === chatId) {
          state.currentChat.messages = messages;
        }
        
        // Update the chat in the chats list
        state.chats = state.chats.map(chat => 
          chat.id === chatId ? { ...chat, messages } : chat
        );
      });
  },
});

export const { 
  setCurrentChat,
  clearChatState
} = chatSlice.actions;

export default chatSlice.reducer;