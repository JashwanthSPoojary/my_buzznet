import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface Member {
  id: number;
  username: string;
  email: string | null;
}

interface MemberState {
  members: Member[];
  selectedMember: number | undefined;
  setMembers: (members: Member[]) => void;
  setSelectedMember: (memberId: number | undefined) => void;
  fetchMembers: (workspaceId: number | undefined) => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  selectedMember: undefined,
  setMembers: (members) => set(() => ({ members })),
  setSelectedMember: (memberId) => set(() => ({ selectedMember: memberId })),
  fetchMembers: async (workspaceId) => {
    if (!token || !workspaceId) return;

    try {
      const response = await api.get(`/workspace/${workspaceId}/members`, {
        headers: { token },
      });
      const members = response.data.data;
      set((state) => {
        if (JSON.stringify(state.members) === JSON.stringify(members)) {
          return {};
        }
        return {members};
      });
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  },
}));
