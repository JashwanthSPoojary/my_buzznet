import { create } from "zustand";
import { MediaConnection } from "peerjs";
import { createPeerInstance } from "../../util/peer";
import { useUserStore } from "./user-slice";
import { useWebsocketStore } from "./ws-slice";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "./workspace-slice";

interface CallStore {
  // State
  incomingCall: MediaConnection | null;
  callerId: string | null;
  isInCall: boolean;
  peerInstance: ReturnType<typeof createPeerInstance> | null;
  showIncomingCall: boolean;

  // Actions
  setIncomingCall: (call: MediaConnection | null) => void;
  setCallerId: (id: string | null) => void;
  setIsInCall: (isInCall: boolean) => void;
  setPeerInstance: (peer: ReturnType<typeof createPeerInstance> | null) => void;
  setShowIncomingCall: (show: boolean) => void;

  // Call handling
  initializePeer: () => void;
  rejectIncomingCall: () => void;
  cleanup: () => void;
  handleAcceptCall: () => void;
}

export const useCallStore = create<CallStore>((set, get) => ({
  // Initial state
  incomingCall: null,
  callerId: null,
  isInCall: false,
  peerInstance: null,
  showIncomingCall: false,

  // Basic setters
  setIncomingCall: (call) => set({ incomingCall: call }),
  setCallerId: (id) => set({ callerId: id }),
  setIsInCall: (isInCall) => set({ isInCall }),
  setPeerInstance: (peer) => set({ peerInstance: peer }),
  setShowIncomingCall: (show) => set({ showIncomingCall: show }),

  // Complex actions
  initializePeer: () => {
    const ws = useWebsocketStore.getState().ws;
    const userId = useUserStore.getState().user?.id;

    console.log("Initializing peer for user:", userId);
  console.log("WebSocket state:", ws?.readyState);

    if (userId && ws) {
      const peer = createPeerInstance(userId + "");

      peer.on("open", (id: string) => {
        console.log("Connected with PeerJS ID:", id);
        ws.send(
          JSON.stringify({
            type: "join-video",
            videoPeerId: id,
            videoUserId: userId,
          })
        );
      });

      peer.on("call", (call) => {
        console.log("Incoming call received from:", call.peer);
        console.log("Call metadata:", call);
        set({
          incomingCall: call,
          showIncomingCall: true,
          callerId: call.peer,
        });
      });
      peer.on("connection", (conn) => {
        console.log("New peer connection:", conn);
      });

      peer.on("error", (err) => {
        console.error("PeerJS Error:", err);
      });

      set({ peerInstance: peer });
    }
  },
  handleAcceptCall: () => {
    set({
      showIncomingCall: false,
      isInCall: true,
    });
  },

  rejectIncomingCall: () => {
    set({
      showIncomingCall: false,
      incomingCall: null,
      callerId: null,
    });
  },

  cleanup: () => {
    const peer = get().peerInstance;
    if (peer) {
      peer.destroy();
    }
    set({
      incomingCall: null,
      callerId: null,
      isInCall: false,
      peerInstance: null,
      showIncomingCall: false,
    });
  },
}));

export const useAcceptCall = () => {
  const navigate = useNavigate();
  const { callerId, handleAcceptCall } = useCallStore();
  const selectedWorkspace = useWorkspaceStore(
    (state) => state.selectedWorkspace
  );

  const acceptIncomingCall = () => {
    handleAcceptCall();
    navigate(`/workspaces/${selectedWorkspace}/dms/${callerId}/videoModal`);
  };
  return acceptIncomingCall;
};
