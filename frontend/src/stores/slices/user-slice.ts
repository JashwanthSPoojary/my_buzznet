import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface User {
  id: number;
  created_at: Date;
  username: string;
  email: string | null;
  password_hash: string;
}

interface UserState {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: undefined,
  setUser: (user) => set(() => ({ user })),
  fetchUser: async () => {
    if (!token) return;

    try {
      const response = await api.get("/user/userdetails", {
        headers: { token: token },
      });
      set(() => ({ user: response.data.data }));
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  },
}));
