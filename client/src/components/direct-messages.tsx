import { useEffect, useRef, useState } from "react";
import DirectMessage from "./direct-message";
import { useFetchDM } from "../hooks/useFetchDM";
import { UseDMContext } from "../context/dmContext";
import { UseUserContext } from "../context/userContext";
import { UseMemberContext } from "../context/memberContext";
import { FaVideo} from "react-icons/fa";
import VideoModal from "./videoModal";
import { useParams } from "react-router-dom";

interface MessagesProps {
  sidebarToggle: boolean;
}

const DirectMessages = ({ sidebarToggle }: MessagesProps) => {
  const {workspaceId, dmId} = useParams();
  

  useFetchDM(
    workspaceId ? parseInt(workspaceId) : 0,
    dmId ? parseInt(dmId) : 0
  );
  const [name, setName] = useState<string>("");
  const { messages, setMessages } = UseDMContext();
  const { users } = UseUserContext();
  const { selectedMember,setSeletedMember } = UseMemberContext();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const lastmessageRef = useRef<HTMLDivElement | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  const handleVideoCall = async () => {
    setIsCallActive(!isCallActive);
  };
  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    if (socket && users?.id && selectedMember && workspaceId && name.trim()) {
      const newMessage = {
        type: "dm",
        content: name,
        userId: users?.id,
        peerId: selectedMember,
        workspaceId: parseInt(workspaceId),
      };      
      socket.send(JSON.stringify(newMessage));
      setName("");
    }
  };

  useEffect(() => {
    if(dmId){
      setSeletedMember(parseInt(dmId));
    }
    if (!users?.id) return;
    const ws = new WebSocket("ws://localhost:3000");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join-dm",
          userId: users?.id,
          peerId: selectedMember,
        })
      );
    };
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);   
      console.log(newMessage);
         
      setMessages((prev) => [...prev, newMessage]);
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };
    setSocket(ws);
    return () => {
      ws.close();
      console.log("WebSocket closed");
    };
  }, [setSeletedMember,dmId,selectedMember, setMessages, users?.id]);
  useEffect(() => {
    if (lastmessageRef.current) {
      lastmessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {isCallActive ? (
        <VideoModal setIsCallActive={setIsCallActive} />
      ) : (
        <div className="bg-[#36393F] flex flex-col flex-1">
          <div
            className={`${
              sidebarToggle ? "hidden" : ""
            } flex-1 overflow-y-auto px-4 sm:block scrollbar-hide`}
          >
            {/* Video Section */}
            <div className="sticky top-0 bg-[#2F3136] flex items-center justify-between p-4 shadow-md z-10">
              <h2 className="text-white font-semibold text-lg">
                Direct Message
              </h2>
              <div className="flex items-center gap-3">
                <button
                  className="bg-[#4c505a] text-white p-2 rounded-full hover:bg-green-600 transition duration-200"
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
            } bg-[#36393F] p-4 sm:block sticky bottom-0`}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow bg-[#4c505a] text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button className="bg-customGreen text-white rounded-md px-4 py-2 font-semibold hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600">
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectMessages;
