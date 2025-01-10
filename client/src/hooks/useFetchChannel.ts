import { useEffect } from "react";
import { UseChannelContext } from "../context/channelContext";
import { api } from "../util/api";
import { token } from "../util/authenticated";
import { UseWorkspaceContext } from "../context/workspaceContext";

export const useFetchChannels = () => {
        const  { setChannels,selectedChannel,setSeletedChannel } = UseChannelContext();
        const { selectedWorkspace } = UseWorkspaceContext();
        useEffect(()=>{
            if(!token) return
            
            const fetchChannels = async () => {
                try {
                    const response = await api.get(`/workspace/${selectedWorkspace}/channel/getchannels`,{headers:{token:token}});
                    setChannels(response.data.data);
                    if(response.data.data.length>0 && !selectedChannel){
                        const firstChannel = parseInt(response.data.data[0].id);
                        setSeletedChannel(firstChannel);
                    }
                } catch (error) {
                    console.log("useFetchChannels error : "+error);
                }
            }
            fetchChannels();
        },[setChannels,selectedChannel,selectedWorkspace,setSeletedChannel]);
}
