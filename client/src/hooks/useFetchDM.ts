import { useEffect } from "react"
import { api } from "../util/api";
import { token } from "../util/authenticated";
import { UseUserContext } from "../context/userContext";
import { UseDMContext } from "../context/dmContext";

export const useFetchDM = (workspaceId:number,memberId:number) => {
    const { users } = UseUserContext();
    const { setMessages } = UseDMContext();
    useEffect(()=>{
        if(!token) return;
        const fetchDM = async () => {
            try {
                const response = await api.post(`/workspace/${workspaceId}/getmessages`,{sender_id:users?.id, receiver_id:memberId},{headers:{token:token}});
                setMessages(response.data.data);
            } catch (error) {
                console.log("useFetchDM error : "+error);
            }
        }
        fetchDM();
    },[setMessages,workspaceId,memberId,users]);
}