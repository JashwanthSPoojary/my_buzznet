import { create } from 'zustand';

interface AppState {
  sidebarToggle: boolean;
  selectChatbot: boolean;
  workspaceModalToggle:boolean;
  actionModalId:number|undefined;
  channelActionToggle:boolean;
  workspaceActionToggle:boolean;
  channelModalToggle: boolean; // New property
  inviteToggle: boolean; // New property
  logoutToggle: boolean; // New property
  setSidebarToggle: (toggle: boolean) => void;
  setSelectChatbot: (select: boolean) => void;
  setworkspaceModalToggle:(toggle: boolean) => void;
  setActionModalId:(id:number)=>void;
  setChannelActionToggle:(toggle: boolean) => void;
  setWorkspaceActionToggle:(toggle: boolean) => void;
  setChannelModalToggle: (toggle: boolean) => void; // New method
  setInviteToggle: (toggle: boolean) => void; // New method
  setLogoutToggle: (toggle: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarToggle: false, // Initial value
  selectChatbot: false, // Initial value
  workspaceModalToggle:false,
  actionModalId:undefined,
  channelActionToggle:false,
  workspaceActionToggle:false,
  channelModalToggle: false, // Initial value
  inviteToggle: false, // Initial value
  logoutToggle: false, // Initial value
  setSidebarToggle: (toggle) => set({ sidebarToggle: toggle }), 
  setSelectChatbot: (select) => set({ selectChatbot: select }), 
  setworkspaceModalToggle: (toggle) => set({ workspaceModalToggle: toggle }),
  setActionModalId:(id:number)=>set({actionModalId:id}),
  setChannelActionToggle:(toggle)=>set(()=>({channelActionToggle:toggle})),
  setWorkspaceActionToggle:(toggle)=>set(()=>({workspaceActionToggle:toggle})),
  setChannelModalToggle: (toggle) => set({ channelModalToggle: toggle }), // New method implementation
  setInviteToggle: (toggle) => set({ inviteToggle: toggle }), // New method implementation
  setLogoutToggle: (toggle) => set({ logoutToggle: toggle })
}));
