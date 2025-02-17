import { create } from "zustand";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface Channel {
  name: string;
  workspace_id: number;
  id: number;
}

interface ChannelState {
  channels: Channel[];
  selectedChannel: number | undefined;
  setChannels: (channels: Channel[] | ((prev: Channel[]) => Channel[])) => void;
  setSelectedChannel: (channelId: number | undefined) => void;
  fetchChannels: (workspaceId: number | undefined) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  selectedChannel: undefined,
  setChannels: (channels) =>
    set((state) => ({
      channels:
        typeof channels === "function" ? channels(state.channels) : channels,
    })),
  setSelectedChannel: (channelId) =>
    set(() => ({ selectedChannel: channelId })),
  fetchChannels: async (workspaceId) => {
    if (!token || !workspaceId) return;
    try {
      const response = await api.get(
        `/workspace/${workspaceId}/channel/getchannels`,
        { headers: { token } }
      );
      const channels = response.data.data;
      set((state) => {
        if (JSON.stringify(state.channels) === JSON.stringify(channels)) {
          return {};
        }
        return {channels};
      });
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  },
}));
