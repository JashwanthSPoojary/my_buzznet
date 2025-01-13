import { FaTimes, FaBars, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { UseChannelContext } from "../context/channelContext";
import { useWebSocketContext } from "../context/webSocketContext";
import { useEffect } from "react";
interface ServerSidebarProps {
  sidebarToggle: boolean;
  setSidebartoggle: React.Dispatch<React.SetStateAction<boolean>>;
  selectChatbot: boolean;
  setSelectChatbot: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({
  sidebarToggle,
  setSidebartoggle,
  setSelectChatbot,
  selectChatbot,
}: ServerSidebarProps) => {
  const { ws } = useWebSocketContext();
  const navigate = useNavigate();
  const { selectedWorkspace } = UseWorkspaceContext();
  const { selectedChannel } = UseChannelContext();
  const handleSwitchChatbot = async () =>{
    setSelectChatbot(true);
    navigate(`/workspaces/${selectedWorkspace}/chatbot`)
  }
  const handleSwitchDashboard = async () => {
    setSelectChatbot(false);
    navigate(`/workspaces/${selectedWorkspace}/channels/${selectedChannel}`)
  }
  useEffect(()=>{
    if(!ws) return;
    const handelMessage = (event:MessageEvent) => {      
      const message = JSON.parse(event.data);
      if(message.type === "incomming-call"){
        console.log(message);
      }
    }
    ws.addEventListener("message",handelMessage)
    return ()=>{
      ws.removeEventListener("message",handelMessage);
    }
  },[ws])
  return (
    <nav className="bg-[#23272A] p-3 flex items-center justify-between">
  <div className="container flex items-center justify-between">
    {/* Toggle Sidebar Button */}
    <div
      onClick={() => setSidebartoggle(!sidebarToggle)}
      className="text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
      aria-label="Toggle navigation"
    >
      {selectChatbot ? (
        <div
          className="text-white font-semibold text-lg cursor-pointer"
          onClick={handleSwitchDashboard}
        >
          Dashboard
        </div>
      ) : (
        <button
          className="text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
          aria-label="Toggle navigation"
        >
          {sidebarToggle ? (
            <FaTimes className="h-5 w-5" />
          ) : (
            <FaBars className="h-5 w-5" />
          )}
        </button>
      )}
    </div>

    {/* Middle Section (Chatbot and Incoming Call) */}
    <div className="flex items-center space-x-4">
      {/* Chatbot Button */}
      <button
        onClick={handleSwitchChatbot}
        className="flex items-center text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
        aria-label="Open chatbot"
      >
        <FaRobot className="h-5 w-5" />
        <span className="ml-2 text-sm">Chatbot</span>
      </button>

    </div>
  </div>
</nav>

  
  );
};

export default Navbar;
