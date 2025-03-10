import { useEffect, useRef, useState } from "react";
import { token } from "../../util/authenticated";
import { api } from "../../util/api";
import { RiSendPlaneLine } from "react-icons/ri";
import ChatbotHero from "./Chat-bot-hero";
import ChatbotMessage from "./Chat-bot-message";

// change this
// streaming , adding to db .           
const ChatBot = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { content: string; author: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const lastmessageRef = useRef<HTMLDivElement | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      const userMessage = { content: message, author: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      const response = await api.post(
        "/chatbot/chatbot",
        { message: message },
        { headers: { token: token } }
      );
      const botMessage = { content: response.data.data, author: "chatbot" };
      setMessages((prev) => [...prev, botMessage]);
      setMessage("");
    } catch (error) {
      console.error("Failed to send chatbot message:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (lastmessageRef.current) {
      lastmessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return (
    <div className="flex flex-1 overflow-hidden bg-[#0B192C] flex-col">
      <div className="flex-1"></div>
      <div className="overflow-y-auto px-4 sm:block scrollbar-hide">
        <ChatbotHero />
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastmessageRef : null}
          >
            <ChatbotMessage content={message.content} author={message.author} />
          </div>
        ))}
        {loading && (
          <ChatbotMessage content="Typing..." author="chatbot" /> 
        )}
      </div>
      <div className="bg-[#0B192C] p-4 sm:block sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-[#0B192C] text-white rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-600"
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
      </div>
    </div>

  )
};

export default ChatBot;
