import { useEffect, useRef, useState } from "react";
import DirectMessage from "./direct-message";
import { useFetchDM } from "../hooks/useFetchDM";
import { UseDMContext } from "../context/dmContext";
import { UseUserContext } from "../context/userContext";
import { UseMemberContext } from "../context/memberContext";
import { FaVideo } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { useWebSocketContext } from "../context/webSocketContext";


interface MessagesProps {
  sidebarToggle: boolean;
}

const DirectMessages = ({ sidebarToggle }: MessagesProps) => {
  const {selectedWorkspace} = UseWorkspaceContext();
  const { workspaceId, dmId } = useParams();
  const { ws } = useWebSocketContext();
  

  useFetchDM(
    workspaceId ? parseInt(workspaceId) : 0,
    dmId ? parseInt(dmId) : 0
  );
  const [name, setName] = useState<string>("");
  const { messages, setMessages } = UseDMContext();
  const { users } = UseUserContext();
  const { selectedMember, setSeletedMember } = UseMemberContext();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const lastmessageRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const handleVideoCall = async () => {
    console.log(selectedMember);
    navigate(`/workspaces/${selectedWorkspace}/dms/${selectedMember}/video/${selectedMember}`);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (socket && users?.id && selectedMember && workspaceId && name.trim()) {

      console.log(selectedMember);
      
      const newMessage = {
        type: "dm",
        content: name,
        userId: users?.id,
        peerId: selectedMember,
        workspaceId: parseInt(workspaceId),
      };
      console.log(newMessage);
      
      socket.send(JSON.stringify(newMessage));
      setName("");
    }
  };

  useEffect(() => {
    if (dmId) {
      setSeletedMember(parseInt(dmId));
    }
    if (!users?.id) return;    
    if(!ws) return;
    const handleOpen = () => {
      console.log("dm ws open");
      ws.send(
        JSON.stringify({
          type: "join-dm",
          userId: users?.id,
          peerId: selectedMember,
        })
      );
    }
    if(ws.readyState === WebSocket.OPEN){
      console.log("hello");
      
      handleOpen();
    }else{
      ws.addEventListener("open",handleOpen);
    }
    const handleMessage = (event: MessageEvent) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMessage]);

    }
    ws.addEventListener("message",handleMessage);
    setSocket(ws);
    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
    }
  }, [setSeletedMember, dmId, selectedMember, setMessages, users?.id,ws]);
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
