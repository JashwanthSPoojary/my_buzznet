import { createContext, ReactNode, useContext, useState } from "react";

interface Channel {
    name: string;
    workspace_id: number;
    id: number;
} 
interface ChannelContextType {
    channels:Channel[];
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    selectedChannel:number | undefined;
    setSeletedChannel: React.Dispatch<React.SetStateAction<number | undefined>>;
}
interface ChannelProviderType {
    children: ReactNode
}

const ChannelContext = createContext<ChannelContextType | undefined >(undefined);
export const ChannelProvider = ({children}:ChannelProviderType) => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [selectedChannel, setSeletedChannel] = useState<number>();
    return (
        <ChannelContext.Provider value={{channels,setChannels,selectedChannel,setSeletedChannel}}>
            {children}
        </ChannelContext.Provider>
    )
}

export const UseChannelContext = () => {
    const context = useContext(ChannelContext);
    if(!context) throw new Error("useChannelContext must be used within a channelProvider");
    return context;
}
