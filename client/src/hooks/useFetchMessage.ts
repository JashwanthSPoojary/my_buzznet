import { useEffect } from "react";
import { api } from "../util/api";
import { token } from "../util/authenticated";
import { UseMessageContext } from "../context/messageContext";

export const useFetchMessages = (workspaceId:number,channelId:number) => {
        const { setMessages } = UseMessageContext();
        useEffect(()=>{
            if(!token) return
            if(!workspaceId) return
            if(!channelId) return
            const fetchMessages = async () => {
                try {
                    const response = await api.get(`/workspace/${workspaceId}/channel/${channelId}/getmessages`,{headers:{token:token}});
                    setMessages(response.data.data);
                } catch (error) {
                    console.log("useFetchChannels error : "+error);
                }
            }
            fetchMessages();
        },[setMessages,workspaceId,channelId]);
}
