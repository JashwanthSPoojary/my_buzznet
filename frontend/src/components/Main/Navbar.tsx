import { FaTimes, FaBars, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAppStore, useChannelStore, useWorkspaceStore } from "../../stores";

const Navbar = () => {
    const navigate = useNavigate();
    const { selectedWorkspace } = useWorkspaceStore();
    const { selectedChannel } = useChannelStore();
    const { sidebarToggle, setSidebarToggle, selectChatbot, setSelectChatbot } = useAppStore();

    const handleNavigation = (isChatbot: boolean) => {
        setSelectChatbot(isChatbot);
        if (isChatbot) {
            navigate(`/workspaces/${selectedWorkspace}/chatbot`);
        } else {
            navigate(`/workspaces/${selectedWorkspace}/channels/${selectedChannel}`);
        }
    };
    return (
        <nav className="bg-[#0B192C] p-3 flex items-center justify-between">
            <div className="container flex items-center justify-between">
                {/* Toggle Sidebar Button */}
                <div
                    onClick={() => setSidebarToggle(!sidebarToggle)}
                    className="text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
                    aria-label="Toggle navigation"
                >
                    {selectChatbot ? (
                        <div
                            className="text-white font-semibold text-lg cursor-pointer"
                            onClick={() => handleNavigation(false)} // Switch to Dashboard
                        >
                            Dashboard
                        </div>
                    ) : (
                        <button
                            className="cursor-pointer text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
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

                {/* Middle Section (Chatbot Button) */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handleNavigation(true)} // Switch to Chatbot
                        className="cursor-pointer flex items-center text-white focus:outline-none transition-colors duration-200 hover:text-gray-300"
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
