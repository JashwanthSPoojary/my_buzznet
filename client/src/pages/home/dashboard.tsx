import Navbar from "../../components/navbar";
import ServerSidebar from "../../components/server-sidebar";
import ChannelSidebar from "../../components/channel-sidebar";
import WorkspaceModal from "../../components/modals/workspace-modal";
import ChannelModal from "../../components/modals/channel-modal";
import ChannelMessages from "../../components/channel-messages";
import { useFetchWorkspaces } from "../../hooks/useFetchWorkspaces";
import { useEffect, useState } from "react";
import Logout from "../../components/modals/logout";
import InviteModal from "../../components/modals/invite-modal";
import ChannelActionModal from "../../components/modals/channel-action-modal";
import WorkspaceActionModal from "../../components/modals/workspace-action-modal";
import ChatbotSection from "../../components/chatbot-section";
import { Route, Routes, useMatch, useParams } from "react-router-dom";
import { UseWorkspaceContext } from "../../context/workspaceContext";
import DirectMessages from "../../components/direct-messages";
import { useFetchUser } from "../../hooks/useFetchUser";
import { useFetchChannels } from "../../hooks/useFetchChannel";
import { UseChannelContext } from "../../context/channelContext";
import { useFetchMembers } from "../../hooks/useFetchMember";

const Dashboard = () => {
  useFetchUser();
  useFetchWorkspaces();
  useFetchChannels();
  useFetchMembers();

  const match = useMatch("/workspaces/:workspaceId/channels/:channelId");
  const { workspaceId } = useParams();
  const channelId = match?.params.channelId;

  const { setSeletedWorkspace } = UseWorkspaceContext();
  const { selectedChannel, setSeletedChannel } = UseChannelContext();

  const [sidebarToggle, setSidebartoggle] = useState<boolean>(false);
  const [workspaceModalToggle, setworkspaceModalToggle] =
    useState<boolean>(false);
  const [channelModalToggle, setchannelModalToggle] = useState<boolean>(false);
  const [logoutToggle, setLogoutToggle] = useState<boolean>(false);
  const [inviteToggle, setInviteToggle] = useState<boolean>(false);
  const [channelActionToggle, setChannelActionToggle] =
    useState<boolean>(false);
  const [workspaceActionToggle, setWorkspaceActionToggle] =
    useState<boolean>(false);
  const [selectChatbot, setSelectChatbot] = useState<boolean>(false);
  const [actionModalId, setActionModalId] = useState<number | null>(null);
  const [voicechannelModalToggle, setvoicechannelModalToggle] =
    useState<boolean>(false);
  useEffect(() => {
    if (workspaceId) {
      setSeletedWorkspace(parseInt(workspaceId));
    }
    if (channelId) {
      setSeletedChannel(parseInt(channelId));
    }
  }, [
    workspaceId,
    selectedChannel,
    channelId,
    setSeletedChannel,
    setSeletedWorkspace,
  ]);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* notification */}
      {/* <CallNotification/> */}
      {/* Modals */}
      <Logout logoutToggle={logoutToggle} setLogoutToggle={setLogoutToggle} />
      <ChannelModal
        channelModalToggle={channelModalToggle}
        setchannelModalToggle={setchannelModalToggle}
      />
      <WorkspaceModal
        workspaceModalToggle={workspaceModalToggle}
        setworkspaceModalToggle={setworkspaceModalToggle}
      />
      <InviteModal
        inviteToggle={inviteToggle}
        setInviteToggle={setInviteToggle}
      />
      <ChannelActionModal
        channelActionToggle={channelActionToggle}
        setChannelActionToggle={setChannelActionToggle}
        actionModalId={actionModalId}
      />
      <WorkspaceActionModal
        workspaceActionToggle={workspaceActionToggle}
        setWorkspaceActionToggle={setWorkspaceActionToggle}
      />

      <Navbar
        sidebarToggle={sidebarToggle}
        setSidebartoggle={setSidebartoggle}
        selectChatbot={selectChatbot}
        setSelectChatbot={setSelectChatbot}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarToggle && !selectChatbot && (
          <>
            <ServerSidebar
              workspaceModalToggle={workspaceModalToggle}
              setworkspaceModalToggle={setworkspaceModalToggle}
            />
            <ChannelSidebar
              key={workspaceId}
              channelModalToggle={channelModalToggle}
              setchannelModalToggle={setchannelModalToggle}
              logoutToggle={logoutToggle}
              setLogoutToggle={setLogoutToggle}
              inviteToggle={inviteToggle}
              setInviteToggle={setInviteToggle}
              setChannelActionToggle={setChannelActionToggle}
              setActionModalId={setActionModalId}
              setWorkspaceActionToggle={setWorkspaceActionToggle}
              voicechannelModalToggle={voicechannelModalToggle}
              setvoicechannelModalToggle={setvoicechannelModalToggle}
            />
          </>
        )}
        <Routes>
          <Route
            path="chatbot"
            element={<ChatbotSection setChatbot={setSelectChatbot} />}
          />
          <Route
            path="channels/:channelId"
            element={<ChannelMessages sidebarToggle={sidebarToggle} />}
          />
          <Route
            path="dms/:dmId/"
            element={<DirectMessages sidebarToggle={sidebarToggle} />}
          />
          {/* <Route
          path="dms/:dmId/video/:callerId"
          element={}/> */}
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
