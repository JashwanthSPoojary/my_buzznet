import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../util/api";

const Googleauth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isTokenSet, setIsTokenSet] = useState(false);
    useEffect(()=>{
        const redirect = async () =>{
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get("token");
            if(token){
                try {
                    localStorage.setItem("buzznettoken",token)
                    const firstWorkspaceId = await api.get('/workspace/workspaceIds',{headers:{token:token}});
                    if(!firstWorkspaceId){
                        throw new Error("not able to get first workspace")
                    }
                    const firstChannelId = await api.get(`/workspace/${firstWorkspaceId.data.data.id}/channel/channelIds`,{headers:{token:token}});
                    if(!firstChannelId){
                        throw new Error("not able to get first channel")
                    }
                    setIsTokenSet(true);
                    navigate(`/workspaces/${firstWorkspaceId.data.data.id}/channels/${firstChannelId.data.data.id}`,{replace:true})
                } catch (error) {
                    console.log("error is in google auth");
                    console.log(error);
                }
            }else{
                navigate('/signin')
            }
            }
            redirect();
    },[navigate,location])

    if(isTokenSet){
        <div className="text-2xl">is Authenticating</div>

    }

    return (
        <div className="text-2xl">is Authenticating</div>
    )
}
 
export default Googleauth;