import { formatTimestamp } from "../util/formatDate";


interface MessageProps {
    author: string;
    content: string;
    timestamp: Date;
}

const DirectMessage = ({ author, content, timestamp }:MessageProps) => {
  return (
    <div className="flex items-start mb-4 hover:bg-gray-800 p-2 rounded">
      <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg font-semibold sm:mr-3">
        {author.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline">
          <span className="font-bold text-white mr-2">{author}</span>
          <span className="text-xs text-gray-400">
            {formatTimestamp(timestamp)};
          </span>
        </div>
        <p className="text-gray-300 mt-1">{content}</p>
      </div>
    </div>
  );
};

export default DirectMessage;
