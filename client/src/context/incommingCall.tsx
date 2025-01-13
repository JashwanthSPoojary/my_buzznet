import { createContext, ReactNode, useContext, useState } from "react";
import { MediaConnection } from "peerjs";

interface CallContextType {
    incomingCall: MediaConnection | null;
    setIncomingCall: React.Dispatch<React.SetStateAction<MediaConnection | null>>;
}

interface CallProviderType {
    children: ReactNode
}

const CallContext = createContext<CallContextType | undefined >(undefined);

export const CallProvider = ({children}:CallProviderType) => {
    const [incomingCall,setIncomingCall] = useState<MediaConnection | null>(null);
    return (
        <CallContext.Provider value={{incomingCall,setIncomingCall}}>
            {children}
        </CallContext.Provider>
    )
}
export const UseCallContext = () => {
    const context = useContext(CallContext);
    if(!context) throw new Error("useCallContext must be used within a CallProvider");
    return context;
}