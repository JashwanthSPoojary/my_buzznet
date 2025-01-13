import { formatTimestamp } from "../util/formatDate";
import { FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import { UseWorkspaceContext } from "../context/workspaceContext";
import { token } from "../util/authenticated";
import { api } from "../util/api";
import { UseChannelContext } from "../context/channelContext";
import { UseUserContext } from "../context/userContext";
import ImageModal from "./modals/Image-modal";

interface MessageProps {
  author: string;
  content: string | null;
  timestamp: Date;
  messageId: number;
  onDelete: (id: number) => void;
  authorId: number;
  file_url: string | null;
}

const ChannelMessage = ({
  author,
  content,
  timestamp,
  messageId,
  onDelete,
  authorId,
  file_url,
}: MessageProps) => {
  const { users } = UseUserContext();
  const isCurrentUser = authorId === users?.id;
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedWorkspace } = UseWorkspaceContext();
  const { selectedChannel } = UseChannelContext();
  const url = "http://localhost:3000";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await api.delete(
        `/workspace/${selectedWorkspace}/channel/${selectedChannel}/message/${messageId}`,
        { headers: { token: token } }
      );
      if (response.data.message) {
        onDelete(messageId);
        console.log("Message deleted");
      } else {
        console.log(response);
        console.log("failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`flex mb-4 p-2 rounded group relative gap-3 ${
        isCurrentUser ? "flex-row-reverse items-end" : "items-start"
      } hover:bg-gray-800`}
    >
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-700 text-white flex items-center justify-center text-lg font-semibold">
        {author.charAt(0).toUpperCase()}
      </div>
      <div
        className={`flex-1 min-w-0 ${
          isCurrentUser ? "text-right" : "text-left"
        }`}
      >
        <div className="flex items-baseline justify-between">
          {!isCurrentUser && (
            <span className="font-bold text-white truncate">{author}</span>
          )}
          <span className="text-xs text-gray-400 sm:ml-2">
            {formatTimestamp(timestamp)}
          </span>
        </div>
        {file_url ? (
          <div
            className="cursor-pointer mt-3 max-w-full sm:max-w-[300px]"
            onClick={() => setSelectedImage(url + file_url)}
          >
            <img
              src={url + file_url}
              alt="Message attachment"
              className="rounded-lg object-cover w-full max-h-[200px] sm:max-h-[300px]"
            />
          </div>
        ) : content ? (
          <p className="text-gray-300 mt-2 break-words">{content}</p>
        ) : null}
      </div>

      {isCurrentUser && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <FaTrashAlt
            className={`text-gray-400 hover:text-red-600 cursor-pointer ${
              isDeleting ? "text-gray-500 cursor-not-allowed" : ""
            }`}
            onClick={isDeleting ? undefined : handleDelete}
          />
        </div>
      )}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default ChannelMessage;
