import { useEffect } from "react";
import Navbar from "../../components/Main/Navbar";
import { ToastContainer } from "react-toastify";
import {
  useWorkspaceStore,
  useChannelStore,
  useAppStore,
  useMemberStore,
  useUserStore,
  useWebsocketStore,
  useCallStore,
} from "../../stores";
import RouteHandler from "../../util/RouteHandler";
import WorkspaceSidebar from "../../components/Main/Sidebars/Workspace-sidebar";
import ChannelSidebar from "../../components/Main/Sidebars/Channel-sidebar";
import { Route, Routes } from "react-router-dom";
import ChatBot from "../../components/chat/Chat-bot";
import WorkspaceModal from "../../components/Main/Modals/Workspace-create";
import ChannelModal from "../../components/Main/Modals/Channel-create";
import WorkspaceActionModal from "../../components/Main/Modals/Workspace-action";
import ChannelActionModal from "../../components/Main/Modals/Channel-action";
import InviteModal from "../../components/Main/Modals/Invite-modal";
import ChannelMessages from "../../components/Main/Messages/channel/Channel-messages";
import DirectMessage from "../../components/Main/Messages/dm/Dms";
import Logout from "../../components/Main/Modals/Log-out";
import env from "../../util/config";
import VideoModal from "../../components/video/Video-modal";
import CallNotification from "../../components/video/Call-notification";

const Dashboard = () => {
  const initializePeer = useCallStore(state=>state.initializePeer);
  // const cleanup = useCallStore(state=>state.cleanup);
  const connect = useWebsocketStore(state=>state.connect);
  const ws = useWebsocketStore(state=>state.ws);
  const disconnect = useWebsocketStore(state=>state.disconnect);
  const { fetchUser } = useUserStore();
  const { fetchWorkspaces, selectedWorkspace } = useWorkspaceStore();
  const { fetchChannels } = useChannelStore();
  const { fetchMembers } = useMemberStore();
  const { sidebarToggle, selectChatbot } = useAppStore();

  useEffect(() => {
    fetchUser();
    fetchWorkspaces();
  }, []);
  useEffect(() => {
    if (selectedWorkspace) {
      Promise.all([
        fetchChannels(selectedWorkspace),
        fetchMembers(selectedWorkspace),
      ]);
    }
  }, [selectedWorkspace]);
  useEffect(()=>{
    connect(env.ws_url);
    return () =>{
      disconnect();
    }
  },[]);
  useEffect(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket is open, initializing peer");
      initializePeer();
    } else {
      console.log("WebSocket not ready:", ws?.readyState);
    }
  }, [ws?.readyState]);
  return (
    <>
      <RouteHandler />
      <div className="w-screen h-screen flex flex-col overflow-hidden">
        <ToastContainer position="bottom-left" theme="dark" />
        <WorkspaceModal />
        <ChannelModal />
        <WorkspaceActionModal />
        <ChannelActionModal />
        <InviteModal />
        <Logout/>
        <Navbar />
        {/* notification */}
        <CallNotification/>
        <div className="flex flex-1 overflow-hidden">
          {sidebarToggle && !selectChatbot && (
            <>
              <WorkspaceSidebar />
              <ChannelSidebar />
            </>
          )}
          <Routes>
            <Route path="chatbot" element={<ChatBot />} />
            <Route path="channels/:channelId" element={<ChannelMessages />} />
            <Route path="dms/:dmId" element={<DirectMessage />} />
            <Route path="dms/:dmId/videoModal" element={<VideoModal />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
