
export interface User {
  id: number;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "DIRECTOR" | "RESIDENT_MANAGER" | "FACILITY_MANAGER" | "RESIDENT" | "INDIVIDUAL";
  image?: string;
}

export interface Message {
  id: number;
  content: string;
  image?: string | null;
  createdAt: string;
  sender: User;
  chatId: number;
  readBy: number[];
}

export interface ChatUser {
  user: User;
}

export interface Chat {
  id: number;
  name?: string | null;
  isGroup: boolean;
  houseId?: number | null;
  house?: { name: string }; // ✅ Add this for frontend
  createdAt: string;
  updatedAt: string;
  users: ChatUser[];
  messages: Message[];
}

// Payload for creating a new chat
export interface CreateChatPayload {
  participantIds: number[];
  houseIds?: number[];
  isGroup: boolean;
}

// Payload for sending a message
export interface SendMessagePayload {
  content: string;
  senderId: number;
  chatId: number;
}