import { createContext, ReactNode, useContext, useState } from "react";

// only need username right 
interface Sender {
    id: number;
    created_at: Date;
    username: string;
    email: string | null;
    password_hash: string;
}
interface Message {
    content: string | null;
    channel_id: number;
    id: number;
    sender_id: number | null;
    created_at: Date;
    sender:Sender,
    file_url: string | null;
} 
interface MessageContextType {
    messages:Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
interface MessageProviderType {
    children: ReactNode
}

const MessageContext = createContext<MessageContextType | undefined >(undefined);
export const MessageProvider = ({children}:MessageProviderType) => {
    const [messages, setMessages] = useState<Message[]>([]);
    return (
        <MessageContext.Provider value={{messages,setMessages}}>
            {children}
        </MessageContext.Provider>
    )
}

export const UseMessageContext = () => {
    const context = useContext(MessageContext);
    if(!context) throw new Error("useMessageContext must be used within a MessageProvider");
    return context;
}
