import {
  FaHashtag,
  FaUserCircle,
  FaPlus,
  FaUserPlus,
  FaCog,
} from "react-icons/fa";
import { UseChannelContext } from "../context/channelContext";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { UseUserContext } from "../context/userContext";
import { UseMemberContext } from "../context/memberContext";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../util/api";
import { token } from "../util/authenticated";
import { useEffect, useState } from "react";

interface ChannelSidebarProps {
  channelModalToggle: boolean;
  setchannelModalToggle: React.Dispatch<React.SetStateAction<boolean>>;
  logoutToggle: boolean;
  setLogoutToggle: React.Dispatch<React.SetStateAction<boolean>>;
  inviteToggle: boolean;
  setInviteToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setChannelActionToggle: React.Dispatch<React.SetStateAction<boolean>>;
  setActionModalId: React.Dispatch<React.SetStateAction<number | null>>;
  setWorkspaceActionToggle: React.Dispatch<React.SetStateAction<boolean>>;
  voicechannelModalToggle: boolean;
  setvoicechannelModalToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelSidebar = ({
  channelModalToggle,
  setchannelModalToggle,
  logoutToggle,
  setLogoutToggle,
  inviteToggle,
  setInviteToggle,
  setChannelActionToggle,
  setActionModalId,
  setWorkspaceActionToggle,
}: ChannelSidebarProps) => {
  const { channelId } = useParams();

  const navigate = useNavigate();
  const { members } = UseMemberContext();
  const { channels,selectedChannel,setSeletedChannel } = UseChannelContext();
  const { workspaces,selectedWorkspace } = UseWorkspaceContext();
  console.log(selectedChannel);
  const [selectedItem,setSelectedItem] = useState<{type:"member"|"channel",id:number|undefined}>({ type: "channel", id: selectedChannel }); 
  const workspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspace
  );
  const { users } = UseUserContext();
  // change this to params 
  const { setSeletedMember } = UseMemberContext();

  const handleChannel = (channelId: number) => {
    setSeletedChannel(channelId);
    setSelectedItem({type:"channel",id:channelId});
    navigate(`/workspaces/${selectedWorkspace}/channels/${channelId}`);
  };

  const handleDM = (id: number) => {
    setSeletedMember(id);
    setSelectedItem({type:"member",id:id});
    navigate(`/workspaces/${selectedWorkspace}/dms/${id}`)
  };
  const handleChannelSettings = async (channelId: number) => {
    try {
      const firstChannelId = await api.get(`/workspace/${selectedWorkspace}/channel/channelIds`,{headers:{token:token}});
      setSeletedChannel(firstChannelId.data.data.id)
      navigate(`/workspaces/${selectedWorkspace}/channels/${firstChannelId.data.data.id}`);
      setActionModalId(channelId);
      setChannelActionToggle(true);
    } catch (error) {
      console.log("error in switch workspace");
      console.log(error);
    }
  };

  useEffect(()=>{
    if(channelId){
      setSeletedChannel(parseInt(channelId));
      setSelectedItem({type:"channel",id:parseInt(channelId)});
    }
  },[channelId,setSeletedChannel]);
  

  return (
<div className="w-60 bg-[#0B192C] flex flex-col text-gray-300 overflow-hidden font-sans">
<div className="p-4 border-b border-[#2C2F33] flex justify-between">
    <h2 className="text-lg font-bold truncate text-[#FFFFFF] font-heading">{workspace?.name}</h2>
    {workspace?.owner_id === users?.id ? (
      <button
        onClick={() => setWorkspaceActionToggle(true)}
        className="text-gray-400 hover:text-[#5CB338]"
      >
        <FaCog />
      </button>
    ) : null}
  </div>
  <div className="flex-1 overflow-y-auto">
    <div className="p-3">
      <div className="flex justify-between items-center group">
        <span className="text-xs uppercase tracking-wide mb-2 text-[#B0BEC5]">
          Text Channels
        </span>
        <FaPlus
          onClick={() => setchannelModalToggle(!channelModalToggle)}
          className="opacity-0 group-hover:opacity-100 cursor-pointer text-[#B0BEC5]"
          size={15}
        />
      </div>
      {channels.map((channel) => (
        <div
          key={channel.id}
          className="flex items-center justify-between mb-1 cursor-pointer hover:bg-[#23272A] rounded p-1 group"
        >
          <div
            onClick={() => handleChannel(channel.id)}
            className="flex items-center"
          >
            <FaHashtag
              className={`${
                selectedItem.type === "channel" && selectedItem.id === channel.id
                  ? "text-[#5CB338]"
                  : "text-gray-400"
              } mr-2 flex-shrink-0`}
            />
            <span
              className={`${
                selectedItem.type === "channel" && selectedItem.id === channel.id
                  ? "text-[#5CB338]"
                  : "text-gray-400"
              } truncate`}
            >
              {channel.name}
            </span>
          </div>

          {channel.name !== "General" && workspace?.owner_id === users?.id ? (
            <button
              onClick={() => handleChannelSettings(channel.id)}
              className="text-gray-400 hover:text-[#5CB338] opacity-0 group-hover:opacity-100"
            >
              <FaCog />
            </button>
          ) : null}
        </div>
      ))}
    </div>
    <div className="p-3 mt-4 border-t border-[#2C2F33]">
      <div className="flex justify-between items-center group">
        <span className="text-xs uppercase tracking-wide mb-2 text-[#B0BEC5]">
          Direct Messages
        </span>
      </div>
      {members.map((member) => (
        <>
          {member.id !== users?.id ? (
            <div
              key={member.id}
              onClick={() => handleDM(member.id)}
              className="flex items-center mb-1 cursor-pointer hover:bg-[#23272A] rounded p-1"
            >
              <FaUserCircle
                className={`${
                  selectedItem.type === "member" && selectedItem.id === member.id
                    ? "text-[#5CB338]"
                    : "text-gray-400"
                } mr-2 flex-shrink-0`}
              />
              <span
                className={`${
                  selectedItem.type === "member" && selectedItem.id === member.id
                    ? "text-[#5CB338]"
                    : "text-gray-400"
                } truncate`}
              >
                {member.username}
              </span>
            </div>
          ) : null}
        </>
      ))}
    </div>
    {workspace?.owner_id === users?.id ? (
      <div className="p-3 mt-4 border-t border-[#2C2F33]">
        <div className="flex justify-between items-center group">
          <span className="text-xs uppercase tracking-wide mb-2 text-[#B0BEC5]">
            Invite Members
          </span>
          <FaPlus
            onClick={() => setInviteToggle(!inviteToggle)}
            className="opacity-0 group-hover:opacity-100 cursor-pointer text-[#B0BEC5]"
            size={15}
          />
        </div>
        <div
          onClick={() => setInviteToggle(!inviteToggle)}
          className="flex items-center mb-1 cursor-pointer hover:bg-[#23272A] rounded p-1"
        >
          <FaUserPlus className="text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-gray-400 truncate">Invite someone</span>
        </div>
      </div>
    ) : null}
  </div>
  <div className="p-3 border-t border-[#2C2F33]">
    <div
      onClick={() => setLogoutToggle(!logoutToggle)}
      className="flex items-center cursor-pointer"
    >
      <FaUserCircle className="w-8 h-8 text-[#5CB338] mr-3 flex-shrink-0" />
      <div className="min-w-0">
        <div className="font-semibold truncate text-[#FFFFFF]">{users?.username}</div>
        <div className="text-xs text-gray-400 truncate">{users?.email}</div>
      </div>
    </div>
  </div>
</div>
  );
};

export default ChannelSidebar;
