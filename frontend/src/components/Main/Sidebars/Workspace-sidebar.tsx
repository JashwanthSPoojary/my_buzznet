import { FaPlus } from "react-icons/fa";
import { useAppStore, useWorkspaceStore } from "../../../stores";
import { api } from "../../../util/api";
import { token } from "../../../util/authenticated";
import { useNavigate } from "react-router-dom";

const WorkspaceSidebar = () => {
  const { selectedWorkspace, workspaces } = useWorkspaceStore();
  const { setworkspaceModalToggle, workspaceModalToggle } = useAppStore();
  const navigate = useNavigate();
  const handleSwitchWorkspace = async (id: number) => {
    try {
      const firstChannelId = await api.get(
        `/workspace/${id}/channel/channelIds`,
        { headers: { token: token } }
      );
      navigate(`/workspaces/${id}/channels/${firstChannelId.data.data.id}`);
    } catch (error) {
      console.log("error in switch workspace");
      console.log(error);
    }
  };

  return (
    <div className="flex w-16 bg-[#0B192C] flex-col items-center py-3 space-y-3 overflow-y-auto">
      <button
        onClick={() => setworkspaceModalToggle(!workspaceModalToggle)}
        className="cursor-pointer w-12 h-12 bg-[#1A2027] rounded-full flex items-center justify-center text-[#FFFFFF] hover:rounded-2xl hover:bg-[#5CB338] transition-all duration-300 ease-linear"
      >
        <FaPlus className="w-6 h-6" />
      </button>
      <div className="w-8 h-0.5 bg-[#1A2027] rounded-full"></div>
      {workspaces.map((workspace, index) => (
        <button
          key={index}
          onClick={() => handleSwitchWorkspace(workspace.id)}
          className={`cursor-pointer w-12 h-12 rounded-2xl flex items-center justify-center text-[#FFFFFF] hover:rounded-2xl transition-all duration-300 ease-linear font-heading ${
            selectedWorkspace === workspace.id ? "bg-[#5CB338]" : "bg-[#1A2027]"
          }`}
        >
          <span className="w-6 h-6">
            {workspace.name.charAt(0).toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

export default WorkspaceSidebar;
