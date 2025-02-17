import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface Message {
    content: string;
    receiver_id: number;
    id: number;
    workspace_id: number;
    sender_id: number;
    created_at: Date;
    sender: {
        username: string;
    };
}

interface MessageState {
    messages: Message[];
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    fetchMessages: (workspaceId: number,userId: number, dmId: number) => Promise<void>;
}

export const useDMStore = create<MessageState>((set) => ({
    messages: [],
    setMessages: (messages) =>
        set((state) => ({
          messages: typeof messages === "function" ? messages(state.messages) : messages,
    })),
    fetchMessages: async (workspaceId,userId, dmId) => {
        if (!token || !workspaceId || !dmId) return;
        try {
            const response = await api.post(`/workspace/${workspaceId}/getmessages`,{sender_id:userId, receiver_id:dmId},{headers:{token:token}});
            set(() => ({ messages: response.data.data }));
        } catch (error) {
            console.log("Error fetching messages:", error);
        }
    }
}));

