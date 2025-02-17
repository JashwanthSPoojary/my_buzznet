import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MediaConnection } from "peerjs";
import { createPeerInstance } from "../util/peer";
import { useNavigate } from "react-router-dom";
import { UseWorkspaceContext } from "./workspaceContext";
import { UseUserContext } from "./userContext";
import { useWebSocketContext } from "./webSocketContext";

interface CallContextType {
  incomingCall: MediaConnection | null;
  setIncomingCall: React.Dispatch<React.SetStateAction<MediaConnection | null>>;
  callerId: string | null;
  setCallerId: React.Dispatch<React.SetStateAction<string | null>>;
  isInCall: boolean;
  setIsInCall: React.Dispatch<React.SetStateAction<boolean>>;
  peerInstance: ReturnType<typeof createPeerInstance> | null;
  showIncomingCall: boolean;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
}

interface CallProviderType {
  children: ReactNode;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: CallProviderType) => {
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(
    null
  );
  const [callerId, setCallerId] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const peerRef = useRef<ReturnType<typeof createPeerInstance> | null>(null);
  const navigate = useNavigate();
  const { selectedWorkspace } = UseWorkspaceContext();
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const { ws } = useWebSocketContext();
  const { users } = UseUserContext();

  useEffect(() => {
    if (users?.id && ws) {
      const generateCallerId = String(
        Math.floor(Math.random() * 10000000)
      ).padStart(7, "0");
      peerRef.current = createPeerInstance(generateCallerId);
      const peer = peerRef.current;
      console.log(peer);

      peer.on("open", (id: string) => {
        console.log("Connected with PeerJS ID:", id);
        console.log("sending join video");

        ws.send(
          JSON.stringify({
            type: "join-video",
            videoPeerId: id,
            videoUserId: users.id,
          })
        );
      });
      peer.on("call", (call) => {
        console.log("call is here");

        setIncomingCall(call);
        setShowIncomingCall(true);
        setCallerId(call.peer);
      });
      peer.on("error", (err) => {
        console.error("PeerJS Error:", err);
      });

      return () => {
        peer.destroy();
        ws.close();
      };
    }
  }, [users?.id, ws]);

  const acceptIncomingCall = () => {
    setShowIncomingCall(false);
    setIsInCall(true);
    // Navigate to video call page
    navigate(`/workspaces/${selectedWorkspace}/dms/${callerId}/videoModal`);

  };
  const rejectIncomingCall = () => {
    setShowIncomingCall(false);
    setIncomingCall(null);
    setCallerId(null);
  };

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        setIncomingCall,
        callerId,
        setCallerId,
        isInCall,
        setIsInCall,
        peerInstance: peerRef.current,
        showIncomingCall,
        acceptIncomingCall,
        rejectIncomingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
export const UseCallContext = () => {
  const context = useContext(CallContext);
  if (!context)
    throw new Error("useCallContext must be used within a CallProvider");
  return context;
};
