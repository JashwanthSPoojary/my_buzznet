import { createContext, ReactNode, useContext, useState } from "react";
interface VoiceChannel {
    name: string;
    id: number;
    workspaceId: number;
    creatorId: number;
    createdAt: Date;
    updatedAt: Date;
};
interface VoiceChannelContextType {
    voiceChannels:VoiceChannel[];
    setVoiceChannels: React.Dispatch<React.SetStateAction<VoiceChannel[]>>;
    selectedVoiceChannel:VoiceChannel | undefined;
    setSeletedVoiceChannel: React.Dispatch<React.SetStateAction<VoiceChannel | undefined>>;
}
interface VoiceChannelProviderType {
    children: ReactNode
}
const VoiceChannelContext = createContext<VoiceChannelContextType | undefined >(undefined);
export const VoiceChannelProvider = ({children}:VoiceChannelProviderType) => {
    const [voiceChannels, setVoiceChannels] = useState<VoiceChannel[]>([]);
    const [selectedVoiceChannel, setSeletedVoiceChannel] = useState<VoiceChannel>();

    return (
        <VoiceChannelContext.Provider value={{voiceChannels,setVoiceChannels,selectedVoiceChannel,setSeletedVoiceChannel}}>
            {children}
        </VoiceChannelContext.Provider>
    )
}
export const UseVoiceChannelContext = () => {
    const context = useContext(VoiceChannelContext);
    if(!context) throw new Error("useVoiceChannelContext must be used within a voiceChannelProvider");
    return context;
}


