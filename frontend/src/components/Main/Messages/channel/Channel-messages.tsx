import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAppStore,
  useChannelStore,
  useMessageStore,
  useUserStore,
  useWebsocketStore,
  useWorkspaceStore,
} from "../../../../stores";
import { api } from "../../../../util/api";
import { token } from "../../../../util/authenticated";
import { RiSendPlaneLine } from "react-icons/ri";
import { CiImageOn } from "react-icons/ci";
import ChannelHero from "./Channel-hero";
import ChannelMessage from "./Channel-message";

const ChannelMessages = () => {
  const sidebarToggle = useAppStore((state) => state.sidebarToggle);
  const selectedWorkspace = useWorkspaceStore(
    (state) => state.selectedWorkspace
  );
  const selectedChannel = useChannelStore((state) => state.selectedChannel);
  const channels = useChannelStore((state) => state.channels);
  const sendMessage = useWebsocketStore(state=>state.sendMessage)
  const { ws } = useWebsocketStore();
  const { user } = useUserStore();
  const { messages, setMessages, fetchMessages } = useMessageStore();
  const sender = useMemo(() => user?.id, [user?.id]);

  const [name, setName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const lastmessageRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelName = useMemo(
    () => channels.find((channel) => channel.id === selectedChannel),
    [channels, selectedChannel]
  );

  const uploadFile = async (file: File) => {
    if (!selectedWorkspace && !selectedChannel && token) return;
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
      `/workspace/${selectedWorkspace}/channel/${selectedChannel}/message/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      }
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
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      return;
    }
    if (!name.trim() && !file) {
      console.error("Message or file must be provided!");
      return;
    }
    if (!selectedChannel || !sender) {
      console.error(
        "Invalid input: Ensure channel, sender, and message/file are provided."
      );
      return;
    }
    let fileUrl: string | null = null;
    try {
      try {
        if (file) {
          fileUrl = await uploadFile(file);
          setFile(null);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      const payload = JSON.stringify({
        type: "message",
        content: name.trim(),
        channelId: selectedChannel,
        userId: sender,
        timestamp: new Date().toISOString(),
        file: fileUrl || null,
      });
      sendMessage(payload);
      setName("");
    } catch (error) {
      console.error("An error occurred while submitting the message:", error);
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
    if (!selectedWorkspace || !selectedChannel) return;
    try {
      fetchMessages(selectedWorkspace, selectedChannel);
    } catch (error) {
      console.error("error in fetchmessages: ", error);
    }
  }, [selectedChannel, selectedWorkspace]);
  useEffect(() => {
    if (!ws) return;
    if(!selectedChannel) return;

    const handleOpen = () => {
      console.log("channel message ws open");
      ws.send(
        JSON.stringify({ type: "join-channel", channelId: selectedChannel })
      );
    }      
    if(ws.readyState === WebSocket.OPEN){        
      handleOpen();
    }else{
      ws.addEventListener("open",handleOpen);
    }

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === "message") {
        setMessages((prev) => [...prev, message]);
      } else if (message.type === "messageDeleted") {
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== message.messageId)
        );
      }
    };
    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws,selectedChannel]);
  useEffect(() => {
    if (lastmessageRef.current) {
      lastmessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="bg-[#0B192C] flex flex-col flex-1">
      <div className="flex-1"></div>
      <div
        className={`${
          sidebarToggle ? "hidden" : ""
        } overflow-y-auto px-4 sm:block scrollbar-hide`}
      >
        <ChannelHero channelName={channelName?.name} />
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
        } bg-[#0B192C] p-4 sm:block sticky bottom-0`}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-[#0B192C] text-white rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
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
