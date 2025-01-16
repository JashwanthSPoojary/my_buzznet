import { UseUserContext } from "../context/userContext";
import { formatTimestamp } from "../util/formatDate";


interface MessageProps {
    author: string;
    content: string;
    timestamp: Date;
    userId:number;
}

const DirectMessage = ({ author, content, timestamp,userId }:MessageProps) => {
  const { users } = UseUserContext();
  const isCurrentUser = userId === users?.id;
  return (
    <div
      className={`flex items-start mb-4 p-2 rounded ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isCurrentUser && (
        <div className="w-10 h-10 rounded-full bg-[#3c3a73] text-white flex items-center justify-center text-lg font-semibold sm:mr-3">
          {author.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={`flex-1 max-w-[75%] ${
          isCurrentUser ? "bg-[#1d385e] text-white ml-auto" : "bg-[#0B192C] text-gray-300"
        } p-3 rounded-lg`}
      >
        <div className="flex items-baseline">
          {!isCurrentUser && (
            <span className="font-bold text-white mr-2 font-heading">{author}</span>
          )}
          <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
            {formatTimestamp(timestamp)}
          </span>
        </div>
        <p className="mt-1 font-sans">{content}</p>
      </div>
    </div>
  );
};

export default DirectMessage;
