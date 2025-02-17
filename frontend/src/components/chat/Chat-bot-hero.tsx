import { FaRobot } from "react-icons/fa";

const ChatbotHero = () => {
  return (
    <div className="bg-gradient-to-r bg-[#0B192C] text-white p-6 border-b border-gray-700 mb-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="bg-[#0B192C] rounded-full p-2">
            <FaRobot className="bg-[#0B192C] text-2xl sm:text-xl" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight hover:text-blue-400 transition duration-300">
            Chatbot
          </h1>
        </div>

        <div className="flex items-center space-x-2 bg-[#0B192C] rounded-full px-4 py-2">
          <span className="text-sm font-medium text-center">
            AI-Powered Assistance
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-400 sm:text-xs md:text-sm lg:text-base sm:w-full md:w-3/4 lg:w-full">
        Welcome to the Chatbot page! Here, you can interact with our AI-powered
        assistant for questions, help, or just casual conversation. Feel free to
        explore its capabilities and share your feedback.
      </p>
    </div>
  );
};

export default ChatbotHero;
