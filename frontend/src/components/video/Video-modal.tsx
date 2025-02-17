import { useEffect, useRef, useState } from "react";
import {
  MdCall,
  MdCancel,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  useCallStore,
  useWorkspaceStore,
  useWebsocketStore,
  useAppStore,
  useMemberStore,
} from "../../stores";
import { useLocalMediaStream } from "../../hooks/useMediaStream";

const VideoModal = () => {
  const { localStream, getLocalStream } = useLocalMediaStream();
  const sidebarToggle = useAppStore((state) => state.sidebarToggle);
  const navigate = useNavigate();
  const selectedMember = useMemberStore((state) => state.selectedMember);

  // Zustand store hooks
  const { peerInstance, isInCall, setIsInCall, incomingCall } = useCallStore();
  const ws = useWebsocketStore((state) => state.ws);
  const selectedWorkspace = useWorkspaceStore(
    (state) => state.selectedWorkspace
  );

  // Local state
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const startCall = async () => {
    try {
      console.log("Starting call with peer:", peerInstance?.id);
      console.log("To receiver:", receiverId);
      setIsVideoOff(false);

      const peer = peerInstance;
      console.log(peer);

      if (!peer) {
        throw new Error("Peer connection not initialized");
      }
      let stream = localStream;
    if (!stream) {
      stream = await getLocalStream();
    }
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
      } else {
        throw new Error("Local stream not available");
      }
      if (!receiverId) {
        throw new Error("Receiver ID not provided");
      }

      const outgoingCall = peer.call(receiverId, stream);
      console.log("Outgoing call created:", outgoingCall);
      if (!outgoingCall) {
        throw new Error("Failed to initiate call");
      }

      outgoingCall.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      outgoingCall.on("error", (error) => {
        console.error("Call error:", error);
        // Handle call errors
      });

      setIsInCall(true);
    } catch (error) {
      console.error("Call failed:", error);
      // Show user-friendly error message
      setIsInCall(false);
      setIsVideoOff(true);
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleCancel = async () => {
    if (localVideoRef.current?.srcObject) {
      const localStream = localVideoRef.current.srcObject as MediaStream;
      localStream.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
      remoteStream.getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsVideoOff(true);
    setIsMuted(false);
    navigate(`/workspaces/${selectedWorkspace}/dms/${selectedMember}`);
  };

  useEffect(() => {
    const peer = peerInstance;

    if (!peer || !ws || !selectedMember) return;

    const handleOpen = () => {
      console.log("request peer id is sent");
      ws.send(
        JSON.stringify({
          type: "request-peer-id",
          targetVideoUserId: selectedMember,
        })
      );
    };

    if (ws.readyState === WebSocket.OPEN) {
      console.log("initial request peer id is sent");
      handleOpen();
    } else {
      ws.addEventListener("open", handleOpen);
    }

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === "response-peer-id") {
        console.log("response peer got ", message.videoPeerId);
        setReceiverId(message.videoPeerId);
      }
    };

    ws.addEventListener("message", handleMessage);

    if (isInCall) {
      const startReceiveCall = async () => {
        try {
          let stream = localStream;
      if (!stream) {
        stream = await getLocalStream();
      }

          if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
          } else {
            throw new Error("Local stream not available for answering call");
          }

          incomingCall?.answer(stream);
          incomingCall?.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        } catch (error) {
          console.error("Error during incoming call handling:", error);
        }
      };

      startReceiveCall();
    }

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      // peer.destroy();
    };
  }, [selectedMember, peerInstance, ws, isInCall, incomingCall]);

  return (
    <div className="flex flex-1 justify-center items-center bg-[#0B192C] text-gray-100">
      <div
        className={`flex flex-col flex-1 justify-between transition-transform duration-300 ${
          sidebarToggle ? "hidden" : ""
        } sm:block`}
      >
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Local video */}
            <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  ref={localVideoRef}
                  autoPlay
                  muted
                />
                {isVideoOff && <MdVideocamOff className="h-16 w-16" />}
              </div>
            </div>
            {/* Remote video */}
            <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  ref={remoteVideoRef}
                  autoPlay
                />
                {!isInCall && <p className="text-lg">Remote Video</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#0B192C] p-4 border-gray-700">
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-6 md:space-y-0 space-y-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } transition-colors duration-200`}
            >
              {isMuted ? (
                <MdMicOff className="h-6 w-6 text-white" />
              ) : (
                <MdMic className="h-6 w-6 text-white" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                isVideoOff
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } transition-colors duration-200`}
            >
              {isVideoOff ? (
                <MdVideocamOff className="h-6 w-6 text-white" />
              ) : (
                <MdVideocam className="h-6 w-6 text-white" />
              )}
            </button>
            {!isInCall && (
              <button
                onClick={startCall}
                className="p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
              >
                <MdCall className="h-6 w-6 text-white" />
              </button>
            )}
            <button
              onClick={handleCancel}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              <MdCancel className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
