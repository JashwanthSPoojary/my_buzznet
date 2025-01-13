import { useEffect, useRef, useState } from "react";
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdCall,
  MdCancel,
} from "react-icons/md";
import { createPeerInstance } from "../../util/peer";
import { UseUserContext } from "../../context/userContext";
import { UseMemberContext } from "../../context/memberContext";
import { useNavigate, useParams } from "react-router-dom";
import { UseWorkspaceContext } from "../../context/workspaceContext";
import { UseCallContext } from "../../context/incommingCall";


const VideoModal = () => {
  // const [socket,setSocket] = useState<WebSocket | null>(null);
  const { setIncomingCall , incomingCall} = UseCallContext();
  const { dmId } = useParams();
  const { setSeletedMember } = UseMemberContext();  
  const { users } = UseUserContext();
  const { selectedMember } = UseMemberContext();
  const [recevierId, setRecevierId] = useState<string | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<ReturnType<typeof createPeerInstance> | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();
  const {selectedWorkspace} = UseWorkspaceContext();
  

  const acceptCall = async () => {
    if (!incomingCall) return;
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    incomingCall.answer(localStream);
    incomingCall.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
    setIncomingCall(null);
    setIsCalling(true)
  };

  const startCall = async () => {
    setIsVideoOff(false);
    const peer = peerRef.current;
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
    setIsCalling(true);
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
  
  
  const handleCancel = () => {
    navigate(`/workspaces/${selectedWorkspace}/dms/${selectedMember}`)
  };


  useEffect(()=>{
    const cleanupMediaTracks = () => {
      console.log("Cleaning up media tracks...");
      
      if (localVideoRef.current?.srcObject) {
        console.log("Local video stream exists:", localVideoRef.current.srcObject);
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
        console.log("Remote video stream exists:", remoteVideoRef.current.srcObject);
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
    
    if(users?.id){      
    peerRef.current = createPeerInstance(users?.id.toString());
    }
    return () => {
      cleanupMediaTracks();
      peerRef.current?.destroy();
      peerRef.current = null;
    }
  },[users?.id]);

  useEffect(() => {
    if(dmId){
      setSeletedMember(parseInt(dmId));
    }
    const peer = peerRef.current;    
    if (!peer) return;
    const ws = new WebSocket("ws://localhost:3000");
    peer.on("open", (id: string) => {
      console.log("Connected with PeerJS ID:", id);
      console.log("Connected to WebSocket");
      ws.send(
        JSON.stringify({
          type: "join-video",
          videoPeerId: id,
          videoUserId: users?.id,
        })
      );
      ws.send(
        JSON.stringify({
          type: "request-peer-id",
          targetVideoUserId: selectedMember,
        })
      );
    });
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "response-peer-id") {
        setRecevierId(message.videoPeerId);
      }
    };
    peer.on("call", (incomingCall) => {
      setIncomingCall(incomingCall);
    });
    const cleanupMediaTracks = () => {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const mediaStream = localVideoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        const mediaStream = remoteVideoRef.current.srcObject as MediaStream;
        mediaStream.getTracks().forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      }
    };
    // setSocket(ws);
    return () => {
      cleanupMediaTracks();
  
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [users?.id, selectedMember,setSeletedMember,dmId,setIncomingCall]);

  return (
    <>
      {incomingCall && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <p className="text-lg font-semibold mb-4 text-gray-800">
              Incoming call...
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded transition-colors duration-200"
              >
                Accept
              </button>
              {/* Uncomment if implementing reject functionality */}
              {/* <button
          onClick={rejectCall}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded transition-colors duration-200"
        >
          Reject
        </button> */}
            </div>
          </div>
        </div>
      )}

<div className="flex flex-col flex-1 bg-gray-900 text-gray-100">
  {/* Video container */}
  <div className="flex-1 flex items-center justify-center p-4">
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
          {!isCalling && <p className="text-lg">Remote Video</p>}
        </div>
      </div>
    </div>
  </div>

  {/* Controls */}
  <div className="bg-gray-800 p-4 border-t border-gray-700">
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
      {!isCalling && 
        <button
          onClick={startCall}
          className="p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <MdCall className="h-6 w-6 text-white" />
        </button>
        }
      <button
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-200"
        onClick={handleCancel}
      >
        <MdCancel className="h-6 w-6 text-white" />
      </button>
    </div>
  </div>
</div>
    </>
  );
};

export default VideoModal;
