interface ChatbotMessageProps {
  content:string;
  author:string
}

const ChatbotMessage = ({content,author}:ChatbotMessageProps) => {
  return (
    <div className="space-y-4">
      {/* User Message (Left-Aligned) */}
      {author==="user"?
      <div className="flex justify-start mb-4">
      <div className="bg-blue-500 bg-opacity-20 text-white p-4 rounded-lg max-w-[80%] sm:max-w-[60%]">
        <p className="break-words">
          {content}
        </p>
      </div>
    </div>:
      <div className="flex justify-end mb-4">
      <div className="bg-gray-700 bg-opacity-50 text-gray-300 p-4 rounded-lg max-w-[80%] sm:max-w-[60%]">
        <p className="break-words">
          {content}
        </p>
      </div>
    </div>
    }
    </div>
  );
};

export default ChatbotMessage;
