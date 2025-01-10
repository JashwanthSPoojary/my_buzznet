import { createContext, ReactNode, useContext, useState } from "react";

interface Message {
    content: string;
    receiver_id: number;
    id: number;
    workspace_id: number;
    sender_id: number;
    created_at: Date;
    sender: {
        username: string;
    };
}
interface MessageContextType {
    messages:Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
interface MessageProviderType {
    children: ReactNode
}
const DMContext = createContext<MessageContextType | undefined >(undefined);
export const DMProvider = ({children}:MessageProviderType) => {
    const [messages, setMessages] = useState<Message[]>([]);
    return (
        <DMContext.Provider value={{messages,setMessages}}>
            {children}
        </DMContext.Provider>
    )
}
export const UseDMContext = () => {
    const context = useContext(DMContext);
    if(!context) throw new Error("useDMContext must be used within a DMProvider");
    return context;
}
