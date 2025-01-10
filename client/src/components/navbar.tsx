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
    <nav className="bg-[#23272A] p-4 flex items-center justify-between">
      <div className="container flex items-center justify-between">
        {/* Toggle Sidebar Button */}
        <div
          onClick={() => setSidebartoggle(!sidebarToggle)}
          className="text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
          aria-label="Toggle navigation"
        >
          {selectChatbot ? (
            <div className="text-white font-semibold text-lg cursor-pointer" onClick={handleSwitchDashboard}>Dashboard</div>
          ) : (
            <button
              onClick={() => setSidebartoggle(!sidebarToggle)}
              className="text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
              aria-label="Toggle navigation"
            >
              {sidebarToggle ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Chatbot Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSwitchChatbot}
            className="flex items-center text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
            aria-label="Open chatbot"
          >
            <FaRobot className="h-6 w-6" />
            <span className="ml-2">Chatbot</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
