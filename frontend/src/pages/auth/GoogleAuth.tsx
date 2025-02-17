import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../util/api";
import { MdErrorOutline } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

const Googleauth = () => {
  //change this
  // loading is struck
    const navigate = useNavigate();
    const location = useLocation();
    const [loading,setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                    navigate(`/workspaces/${firstWorkspaceId.data.data.id}/channels/${firstChannelId.data.data.id}`,{replace:true})
                } catch (error) {
                    setError("Authentication failed. Please try again.");
                    console.log(error);
                }finally{
                    setLoading(false);
                }
            }else{
                await navigate('/signin')
            }
            }
            redirect();
    });

    if (loading) {
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center bg-black">
            <FaSpinner className="text-blue-500 animate-spin text-6xl mb-4" />
            <p className="text-2xl text-gray-600">Authenticating...</p>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center bg-black">
            <MdErrorOutline className="text-red-500 text-6xl mb-4" />
            <p className="text-2xl text-gray-800">{error}</p>
            <button
              onClick={() => navigate("/signin")}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Go to Sign In
            </button>
          </div>
        );
      }
    

    return null;
}
 
export default Googleauth;