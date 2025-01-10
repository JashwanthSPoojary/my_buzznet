import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface VoiceConnectionContextType {
    intializeConnection: (voiceChannelId:number,isInitiator:boolean)=>Promise<void>;
}
interface VoiceConnectionProviderProps {
    children: ReactNode;
}
const VoiceConnectionContext = createContext<VoiceConnectionContextType | undefined>(undefined);
export const VoiceConnectionProvider = ({ children }: VoiceConnectionProviderProps) => {
    const [peerConnection,setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [audioElement,setAudioElement] = useState<HTMLAudioElement|null>(null);


    const intializeConnection = async (voiceChannelID:number,isInitiator:boolean) =>{
        try {
            const ws = new WebSocket("ws://localhost:3000");
            setWebSocket(ws);

            ws.onopen = () =>{
                console.log("websocket connection established");
                ws.send(JSON.stringify({type:"join-voice-channel",voiceChannelId:voiceChannelID}));
            }
            ws.onmessage = async (event) =>{
                const message = JSON.parse(event.data);
                if(message.type==="voice-offer" && !isInitiator && peerConnection){
                    const { sdp,voiceChannelId } = message;
                    if(voiceChannelId===voiceChannelID){
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        ws.send(
                            JSON.stringify({
                              type: "voice-answer",
                              voiceChannelId: voiceChannelId,
                              sdp: answer,
                        }))
                    }
                }
                if(message.type === "voice-answer"  && peerConnection){
                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription(message.sdp)
                    )
                }else if(message.type==="voice-ice-candidate" && peerConnection){
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
                }
            }
            const pc = new RTCPeerConnection({
                iceServers:[{urls:"stun:stun.l.google.com:19302"}]
            })
            pc.onicecandidate = (event) => {
                if(event.candidate){
                    ws.send(JSON.stringify({
                        type:"voice-ice-candidate",
                        voiceChannelId:voiceChannelID,
                        candidate:event.candidate
                    }))
                }
            }

            pc.ontrack = (event) =>{
                console.log("remote track received");
                const [remoteStream] = event.streams;
                if(audioElement){
                    audioElement.srcObject=remoteStream;
                    audioElement.play().catch((err) => {
                        console.error("Failed to play audio", err)})
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            if(isInitiator){
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                ws.send(JSON.stringify({
                    type:"voice-offer",
                    voiceChannelId:voiceChannelID,
                    sdp:offer
                }))
            }

            setPeerConnection(pc);
        } catch (error) {
            console.error("voice connection error :"+error)
        }
    }
    useEffect(()=>{
        const audio = new Audio();
        setAudioElement(audio);
        return () => {
            if (audio) audio.pause();
        }
    },[]);
    return (
        <VoiceConnectionContext.Provider value={{ intializeConnection }}>
          {children}
        </VoiceConnectionContext.Provider>
      );
}

export const useVoiceConnectionContext = ()=> {
    const context = useContext(VoiceConnectionContext);
    if (!context) {
      throw new Error("useVoiceConnection must be used within a VoiceConnectionProvider");
    }
    return context;
};


