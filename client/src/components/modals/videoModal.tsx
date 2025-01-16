import { useEffect, useRef, useState } from "react";
import { UseCallContext } from "../../context/incommingCall";
import {
  MdCall,
  MdCancel,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { UseChannelContext } from "../../context/channelContext";
import { UseWorkspaceContext } from "../../context/workspaceContext";
import { useWebSocketContext } from "../../context/webSocketContext";

interface VideoModalProps {
  sidebarToggle: boolean;
}

const VideoModal = ({ sidebarToggle }: VideoModalProps) => {
  const { dmId } = useParams();
  const navigate = useNavigate();
  const { peerInstance, isInCall, setIsInCall, incomingCall } =
    UseCallContext();
  const { ws } = useWebSocketContext();
  const { setSeletedChannel } = UseChannelContext();
  const { selectedWorkspace } = UseWorkspaceContext();
  const [recevierId, setRecevierId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const startCall = async () => {
    setIsVideoOff(false);
    const peer = peerInstance;
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (!recevierId) return;
    const outgoingCall = peer?.call(recevierId, localStream);
    if (!outgoingCall) return;
    outgoingCall.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
    setIsInCall(true);
  };
  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };
  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };
  const handleCancel = async () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const localStream = localVideoRef.current.srcObject as MediaStream;
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
      remoteStream.getTracks().forEach((track) => {
        track.stop();
      });
      remoteVideoRef.current.srcObject = null;
    }
    setIsInCall(false);
    setIsVideoOff(true);
    setIsMuted(false);
    navigate(`/workspaces/${selectedWorkspace}/dms/${dmId}`);
  };

  useEffect(() => {
    if (dmId) {
      setSeletedChannel(parseInt(dmId));
    }
    const peer = peerInstance;
    if (!peer) return;
    if (!ws) return;
    const handleOpen = () => {
      console.log("request peer id is sent");
      ws.send(
        JSON.stringify({
          type: "request-peer-id",
          targetVideoUserId: parseInt(dmId as string),
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
        console.log("response peer got ");
        console.log(message.videoPeerId);
        setRecevierId(message.videoPeerId);
      }
    };
    ws.addEventListener("message", handleMessage);
    // let cleanupCallResources: (() => void) | null = null;
    if (isInCall) {
      const startRecieveCall = async () => {
        try {
          const localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
          incomingCall?.answer(localStream);
          const onStreamHandler = (remoteStream: MediaStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          };
          incomingCall?.on("stream", onStreamHandler);
          // cleanupCallResources = () => {
          //   incomingCall?.off("stream", onStreamHandler);
          // };
        } catch (error) {
          console.log(error);
        }
      };
      startRecieveCall();
    }

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
      // if(cleanupCallResources){
      //   cleanupCallResources();
      // }
      peerInstance.destroy();
    };
  }, [dmId, setSeletedChannel, peerInstance, ws, isInCall, incomingCall]);

  useEffect(() => {
    const cleanupMediaTracks = () => {
      console.log("Cleaning up media tracks...");

      if (localVideoRef.current?.srcObject) {
        console.log(
          "Local video stream exists:",
          localVideoRef.current.srcObject
        );
        const localStream = localVideoRef.current.srcObject as MediaStream;
        localStream.getTracks().forEach((track) => {
          console.log("Stopping local track:", track);
          track.stop();
        });
        localVideoRef.current.srcObject = null;
      } else {
        console.log("No local video stream found.");
      }

      if (remoteVideoRef.current?.srcObject) {
        console.log(
          "Remote video stream exists:",
          remoteVideoRef.current.srcObject
        );
        const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
        remoteStream.getTracks().forEach((track) => {
          console.log("Stopping remote track:", track);
          track.stop();
        });
        remoteVideoRef.current.srcObject = null;
      } else {
        console.log("No remote video stream found.");
      }
    };
    return () => {
      cleanupMediaTracks();
    };
  }, []);

  return (
    <>
      <div className="flex flex-1 justify-center items-center bg-[#0B192C] text-gray-100">
        <div
          className={`flex flex-col flex-1 justify-between transition-transform duration-300 ${
            sidebarToggle ? "hidden" : ""
          } sm:block`}
        >
          {/* Video container */}
          <div className={`flex-1 flex items-center justify-center p-4 `}>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Local video */}
              <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden relative border border-gray-700">
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    ref={localVideoRef} // React ref for the local video
                    autoPlay
                    muted
                  ></video>
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
                  ></video>
                  {!isInCall && <p className="text-lg">Remote Video</p>}
                </div>
              </div>
            </div>
          </div>
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
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200"
                onClick={handleCancel}
              >
                <MdCancel className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoModal;
