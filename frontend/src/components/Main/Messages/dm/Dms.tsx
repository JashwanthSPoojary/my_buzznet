import {
  useAppStore,
  useDMStore,
  useMemberStore,
  useUserStore,
  useWebsocketStore,
  useWorkspaceStore,
} from "../../../../stores";
import { useEffect, useId, useRef, useState } from "react";
import DirectMessage from "./Dm";
import { FaVideo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DirectMessages = () => {
  const navigate = useNavigate();
  const sidebarToggle = useAppStore((state) => state.sidebarToggle);
  const userId = useUserStore((state) => state.user?.id);
  const selectedWorkspace = useWorkspaceStore(
    (state) => state.selectedWorkspace
  );
  const selectedMember = useMemberStore((state) => state.selectedMember);
  const [name, setName] = useState<string>("");
  const sendMessage = useWebsocketStore(state=>state.sendMessage);
  const { ws} = useWebsocketStore();
  const { messages, setMessages, fetchMessages } = useDMStore();
  const lastmessageRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ws || ws.readyState != WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      return;
    }
    if (!name.trim()) {
      console.error("Message  must be provided!");
      return;
    }
    if (!selectedMember) {
      console.error(
        "Invalid input: Ensure member, sender, and message/file are provided."
      );
      return;
    }
    try {
      const payload = JSON.stringify({
        type: "dm",
        content: name,
        userId: userId,
        peerId: selectedMember,
        workspaceId: selectedWorkspace,
      });
      sendMessage(payload);
      setName("");
    } catch (error) {
      console.error("handle submit error :", error);
    }
  };
  const handleVideoCall = () =>{
    navigate(`videoModal`)
  }

  useEffect(() => {
    if (!selectedWorkspace || !selectedMember || !userId) return;
    try {
      fetchMessages(selectedWorkspace,userId, selectedMember);
    } catch (error) {
      console.error("error in fetchmessages: ", error);
    }
  }, [selectedMember,selectedWorkspace,userId]);
  useEffect(() => {
    if (!ws || !selectedMember || !useId ) return;
    
    const handleOpen = () => {
      console.log("dm ws open");
      ws.send(
        JSON.stringify({
          type: "join-dm",
          userId: userId,
          peerId: selectedMember,
        })
      );
    }
    if(ws.readyState === WebSocket.OPEN){        
      handleOpen();
    }else{
      ws.addEventListener("open",handleOpen);
    }

    const handleMessage = (event: MessageEvent) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);
    };
    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws,selectedMember,useId]);
  useEffect(() => {
    if (lastmessageRef.current) {
      lastmessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="bg-[#0B192C] flex flex-col flex-1">
        <div
          className={`${
            sidebarToggle ? "hidden" : ""
          } flex-1 overflow-y-auto px-4 sm:block scrollbar-hide`}
        >
          {/* Video Section */}
          <div className="sticky top-0 bg-[#0B192C] flex items-center justify-between p-4 shadow-md z-10">
            <h2 className="text-white font-semibold text-lg font-heading">
              Direct Message
            </h2>
            <div className="flex items-center gap-3">
              <button
                className="bg-[#0B192C] text-white p-2 rounded-full hover:bg-green-600 transition duration-200"
                onClick={handleVideoCall}
              >
                <FaVideo className="w-5 h-5" />
              </button>
            </div>
          </div> 

          {/* Messages Section */}
          {messages.map((message, index) => (
            <div
              key={index}
              ref={index === messages.length - 1 ? lastmessageRef : null}
            >
              <DirectMessage
                key={message.id}
                userId={message.sender_id}
                author={message.sender.username}
                content={message.content}
                timestamp={message.created_at}
              />
            </div>
          ))}
        </div>

        {/* Message Input Section */}
        <div
          className={`${
            sidebarToggle ? "hidden" : ""
          } bg-[#0B192C] p-4 sm:block sticky bottom-0`}
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow bg-[#0B192C] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button className="bg-customGreen text-white rounded-md px-4 py-2 font-semibold hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 font-sans">
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DirectMessages;
