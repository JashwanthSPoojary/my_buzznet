import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface Sender {
  id: number;
  created_at: Date;
  username: string;
  email: string | null;
  password_hash: string;
}

interface Message {
  content: string | null;
  channel_id: number;
  id: number;
  sender_id: number | null;
  created_at: Date;
  sender: Sender;
  file_url: string | null;
}

interface MessageState {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  fetchMessages: (workspaceId: number, channelId: number) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  setMessages: (messages) =>
    set((state) => ({
      messages: typeof messages === "function" ? messages(state.messages) : messages,
    })),
  fetchMessages: async (workspaceId, channelId) => {
    if (!token || !workspaceId || !channelId) return;
    try {
      const response = await api.get(
        `/workspace/${workspaceId}/channel/${channelId}/getmessages`,
        { headers: { token: token } }
      );
      set(() => ({ messages: response.data.data }));
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  },
}));
