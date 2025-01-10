import { useEffect } from "react";
import { UseVoiceChannelContext } from "../context/voiceChannelContext";
import { UseUserContext } from "../context/userContext";
import { useVoiceConnectionContext } from "../context/voiceConnection";

interface JoinVoiceModalProps {
  setEnterVoiceChannel: React.Dispatch<React.SetStateAction<boolean>>
}

const JoinVoiceModal = ({setEnterVoiceChannel}:JoinVoiceModalProps) => {
  const { users } = UseUserContext();
  const { selectedVoiceChannel } = UseVoiceChannelContext();
  const isCreator = users?.id === selectedVoiceChannel?.creatorId;
  const { intializeConnection } = useVoiceConnectionContext();

  const handleJoin = async () => {
    if(!selectedVoiceChannel?.id) return
    await intializeConnection(selectedVoiceChannel?.id,false);
    setEnterVoiceChannel(true);
  }
  useEffect(()=>{
    const handleJoinAsInitiator = async () => {
      if(isCreator){
        setEnterVoiceChannel(true)
      }
    }
    handleJoinAsInitiator();
  },[isCreator,setEnterVoiceChannel]);
    
  return (
    <div className="flex-1 bg-gray-800 flex flex-col items-center justify-between p-4 overflow-hidden">
      <main className="text-center w-full max-w-md mx-auto px-4 flex-grow flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
          Voice Channel
        </h1>
        <button 
        onClick={handleJoin}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md px-4 py-3 sm:px-8 sm:py-4 text-lg sm:text-xl transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50">
          Join {selectedVoiceChannel?.name} Voice Channel
        </button>
      </main>

      <footer className="w-full mt-8 text-center text-white text-sm">
        <p>&copy; {new Date().getFullYear()} Your Buzznet Workspace</p>
      </footer>
    </div>
  );
};

export default JoinVoiceModal;
