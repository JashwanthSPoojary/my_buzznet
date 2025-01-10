import { FaPlus } from "react-icons/fa";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { useNavigate } from "react-router-dom";
import { api } from "../util/api";
import { token } from "../util/authenticated";


interface ServerSidebarProps{
    workspaceModalToggle:boolean;
    setworkspaceModalToggle :React.Dispatch<React.SetStateAction<boolean>>;
}


const ServerSidebar = ({workspaceModalToggle,setworkspaceModalToggle}:ServerSidebarProps) => {
  const navigate = useNavigate();
  const { workspaces } = UseWorkspaceContext();
  const { selectedWorkspace } = UseWorkspaceContext();

  const handleSwitchWorkspace = async (id:number) =>{
    try {
      const firstChannelId = await api.get(`/workspace/${id}/channel/channelIds`,{headers:{token:token}});
      navigate(`/workspaces/${id}/channels/${firstChannelId.data.data.id}`);
    } catch (error) {
      console.log("error in switch workspace");
      console.log(error);
    }
  }
  return (
    <div className=" flex w-16 bg-[#23272A] flex-col items-center py-3 space-y-3 overflow-y-auto">
      <button
      onClick={()=>setworkspaceModalToggle(!workspaceModalToggle)}
       className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white hover:rounded-2xl transition-all duration-300 ease-linear">
        <FaPlus className="w-6 h-6" />
      </button>
      <div className="w-8 h-0.5 bg-gray-700 rounded-full"></div>
      {workspaces.map((workspace,index)=>(
        <button
        key={index}
        onClick={()=>handleSwitchWorkspace(workspace.id)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:rounded-2xl transition-all duration-300 ease-linear ${
          selectedWorkspace === workspace.id ? "bg-customGreen" : "bg-gray-700"
        }`}
        >
          <span className="w-6 h-6">{workspace.name.charAt(0).toUpperCase()}</span>
        </button>
      ))}
      
    </div>
  );
};

export default ServerSidebar;