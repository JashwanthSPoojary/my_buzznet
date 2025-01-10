import { useEffect, useState } from "react";
import { UseVoiceChannelContext } from "../context/voiceChannelContext";
import { useVoiceConnectionContext } from "../context/voiceConnection";



const VoiceChannel = () => {
  const { intializeConnection } = useVoiceConnectionContext();
  const { selectedVoiceChannel } = UseVoiceChannelContext();

  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);

  const toggleMute = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getAudioTracks().forEach((track) => (track.enabled = !muted));
    setMuted(!muted);
  };

  useEffect(()=>{
    const handleJoinAsInitiator = async () => {
      if(!selectedVoiceChannel?.id) return;
      await intializeConnection(selectedVoiceChannel?.id,true);
    }
    handleJoinAsInitiator();
  },[])

  return (
    <div className="flex flex-col items-center bg-gray-900 text-white p-6">
    <h1 className="text-2xl font-bold mb-4">Voice Channel</h1>

    <ul className="mb-4">
      {participants.map((participant, index) => (
        <li key={index} className="mb-2">
          {participant}
        </li>
      ))}
    </ul>

    <div className="flex gap-4">
      <button
        onClick={toggleMute}
        className={`px-4 py-2 rounded-md ${
          muted ? "bg-red-500" : "bg-green-500"
        } transition-all`}
      >
        {muted ? "Unmute" : "Mute"}
      </button>

      <button
        // onClick={onLeave}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-all"
      >
        Leave Channel
      </button>
    </div>
  </div>
  );
};

export default VoiceChannel;
