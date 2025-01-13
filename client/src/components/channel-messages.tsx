import { useEffect, useRef, useState } from "react";
import { UseMessageContext } from "../context/messageContext";
import ChannelMessage from "./channel-message";
import { UseChannelContext } from "../context/channelContext";
import { UseUserContext } from "../context/userContext";
import ChannelHero from "./channel-hero";
import { CiImageOn } from "react-icons/ci";
import { RiSendPlaneLine } from "react-icons/ri";
import { api } from "../util/api";
import { token } from "../util/authenticated";
import { useFetchMessages } from "../hooks/useFetchMessage";
import { useParams } from "react-router-dom";
import { useWebSocketContext } from "../context/webSocketContext";

interface MessagesProps {
  sidebarToggle: boolean;
}
const ChannelMessages = ({ sidebarToggle }: MessagesProps) => {
const { ws } = useWebSocketContext();
const {workspaceId, channelId} = useParams();

useFetchMessages(
  workspaceId ? parseInt(workspaceId) : 0,
  channelId ? parseInt(channelId) : 0
);
  
  const { users } = UseUserContext();
  const { messages, setMessages } = UseMessageContext();
  const [name, setName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const { channels,selectedChannel } = UseChannelContext();
  const channelName = channels.find(
    (channel) => channel.id ===  selectedChannel
  );
  
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const sender = users?.id;
  const lastmessageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/workspace/${workspaceId}/channel/${channelId?parseInt(channelId):0}/message/upload`,
      formData,
      { headers: { 
        "Content-Type": "multipart/form-data",
        token: token 
      } }
    );
    if (response.data.error) {
      console.log("File was not able to upload");
      return;
    }
    const fileUrl = response.data.filePath;
    return fileUrl;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    
    if (socket && channelId && sender && (name.trim() || file)) {      
      let fileUrl = null;
      if (file) {
        fileUrl = await uploadFile(file);
        setFile(null);
      }
      const newMessage = {
        type: "message",
        content: name,
        channelId: parseInt(channelId),
        userId: sender,
        timestamp: new Date().toISOString(),
        file: fileUrl || null,
      };
      socket.send(JSON.stringify(newMessage));
      setName("");
    }
  };
  const handleDelete = (messageId: number) => {
    console.log(messageId);
    setMessages((prevMessages) =>
      prevMessages.filter((message) => message.id !== messageId)
    );
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if(!ws) return;
    if(!channelId) return;
    
              
      const handleOpen = () => {
        console.log("channel message ws open");
        ws.send(
          JSON.stringify({ type: "join-channel", channelId: parseInt(channelId) })
        );
      }      
      if(ws.readyState === WebSocket.OPEN){        
        handleOpen();
      }else{
        ws.addEventListener("open",handleOpen);
      }

      const handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if(message.type === "message"){
          setMessages((prev) => [...prev, message]);
        }
        if(message.type === "messageDeleted"){
          console.log(message);
           setMessages(messages=>messages.filter(msg=>msg.id !== message.messageId))
        }
      }
      ws.addEventListener("message",handleMessage);    
    setSocket(ws);
    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
    }
  }, [channelId, setMessages,ws]);
  useEffect(() => {
    if (lastmessageRef.current) {
      lastmessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if(!workspaceId || !channelId) return <div>no channel id or workspace id</div>


  return (
    <div className="bg-[#36393F] flex flex-col flex-1">
      <div className="flex-1"></div>
      <div
        className={`${
          sidebarToggle ? "hidden" : ""
        } overflow-y-auto px-4 sm:block scrollbar-hide`}
      >
        <ChannelHero
          channelName={channelName?.name}
        />
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastmessageRef : null}
          >
            <ChannelMessage
              key={message.id}
              author={message.sender.username}
              content={message.content}
              timestamp={message.created_at}
              messageId={message.id}
              onDelete={handleDelete}
              authorId={message.sender.id}
              file_url={message.file_url}
            />
          </div>
        ))}
      </div>

      <div
        className={`${
          sidebarToggle ? "hidden" : ""
        } bg-[#36393F] p-4 sm:block sticky bottom-0`}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-[#4c505a] text-white rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
            >
              <CiImageOn className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white rounded-md px-4 py-2 font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 flex items-center gap-2"
          >
            <RiSendPlaneLine className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        {file && (
          <div className="mt-4 p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 flex items-center gap-2">
            <span className="font-semibold text-green-400">Selected file:</span>
            <span className="truncate">{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelMessages;
