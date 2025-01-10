import { useEffect, useRef, useState } from "react";
import { UseVoiceChannelContext } from "../context/voiceChannelContext";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { api } from "../util/api";
import { token } from "../util/authenticated";
import JoinVoiceModal from "./join-voice-modal";
import { UseUserContext } from "../context/userContext";


type Participants =  {
    id:number
}

const VoiceChannelSection = () => {
  const { users } = UseUserContext();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setWs(socket);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, []);
  const sendMessage = (message:{type:string,targetId:number,payload:RTCIceCandidate | null}) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  const [currentChannels, setCurrentChannels] = useState<[] | null>([]);
  const { selectedWorkspace } = UseWorkspaceContext();
  const { selectedVoiceChannel, voiceChannels } = UseVoiceChannelContext();
  const voiceChannelId = voiceChannels.find(
    (voiceChannel) => voiceChannel.id === selectedVoiceChannel
  );
  const fetchParticipants = async (channelId:number | undefined) => {
    const response = await api.get(`/workspace/${selectedWorkspace}/voicechannel/participants/:${channelId}`);
    return response.data.data;
  }

  const handleJoin = async () => {
    try {
      const response = await api.post(
        `/workspace/${selectedWorkspace}/voicechannel/join`,
        { channelId: voiceChannelId?.id },
        { headers: { token: token } }
      );
      const participants:Participants[] = await fetchParticipants(voiceChannelId?.id);
      const channelData = response.data.data;
      setCurrentChannels(channelData);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
            participants.forEach((participant)=>{
                if(participant.id !== users?.id ){
                    sendMessage({
                        type: "voice-ice-candidate",
                        targetId: participant.id, 
                        payload: event.candidate,
                      });
                }
            })
        }
      };
      setPeerConnection(pc);

      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      if(localVideoRef.current){
        localVideoRef.current.srcObject=stream;
      }
      stream.getTracks().forEach((track)=>pc.addTrack(track,stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendMessage({
        type:"voice-offer",
        payload:offer
      })

    } catch (error) {
      console.log("join channel error" + error);
    }
  };
  const handleLeaveChannel = () => {
    setCurrentChannels(null);
  };
  useEffect(() => {
    if (voiceChannelId) {
      console.log("Joined channel:", voiceChannelId.name);
      // Add WebSocket signaling and WebRTC setup logic here
    }
  }, [voiceChannelId]);

  useEffect(()=>{
    const handleSignalingMessage = async (message:{type:string,payload:RTCIceCandidate | undefined,sendId:number}) => {
        const { type, payload, senderId } = message;
        if(type==="voice-ice-candidate"){
            await peerConnection?.addIceCandidate(new RTCIceCandidate(payload))
            .catch((error) => console.error("Error adding received ICE candidate:", error));
        }

    }
    if(!ws) return;
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleSignalingMessage(message)
    }
  },[]);

  return (
    <>
      {!currentChannels && <JoinVoiceModal onhandle={handleJoin} />}
      {currentChannels && (
        <div className="bg-[#36393F] flex flex-col flex-1">
          <main className="flex-grow p-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* {participants.map((participant) => ( */}
              <div className="video-container flex flex-col space-y-4">
                {/* Local Video Stream */}
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="rounded-lg w-full h-full object-cover"
                  />
                  {!localVideoRef.current?.srcObject && (
                    <span className="text-lg text-white">Local User</span>
                  )}
                </div>

                {/* Remote Video Stream */}
                <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                  {remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      className="rounded-lg w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-white">
                      Waiting for Remote User
                    </span>
                  )}
                </div>
              </div>

              {/* ))} */}
            </div>
          </main>
          <footer className="bg-gray-900 p-4">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              >
                {isMicOn ? (
                  <MdMicOff className="w-6 h-6" />
                ) : (
                  <MdMic className="w-6 h-6" />
                )}
              </button>
              {isMicOn && !isCallActive && (
                <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                  <MdAddCall className="w-6 h-6" />
                </button>
              )}
              {isMicOn && isCallActive && (
                <button className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
                  <MdCallEnd className="w-6 h-6" />
                </button>
              )}
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default VoiceChannelSection;
