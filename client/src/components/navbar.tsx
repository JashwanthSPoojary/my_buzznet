import { FaTimes, FaBars, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { UseChannelContext } from "../context/channelContext";
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
  return (
    <nav className="bg-[#0B192C] p-3 flex items-center justify-between">
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
