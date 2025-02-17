import { useEffect, useMemo, useState } from "react";
import { api } from "../../../util/api";
import { token } from "../../../util/authenticated";
import { useAppStore, useChannelStore, useWorkspaceStore } from "../../../stores";
import { toast } from "react-toastify";



const ChannelActionModal = () => {
    type Action = "delete" | "rename" | null;
    const { channelActionToggle,setChannelActionToggle,actionModalId} = useAppStore();
  const { channels,setChannels } = useChannelStore();
  const { selectedWorkspace } = useWorkspaceStore();
  const channel = useMemo(()=>channels.find(channel=>channel.id===actionModalId),[channels,actionModalId]);
  const [newName, setNewName] = useState(channel?.name||"");
  const [action, setAction] = useState<Action>(null);
  const handleAction = async () => {
    if (action==="delete") {
        try {
            await api.delete(`/workspace/${selectedWorkspace}/channel/${actionModalId}`,{headers:{token:token}});
            setChannels (prevChannels => prevChannels.filter(channel => channel.id !== actionModalId));
            setChannelActionToggle(false);
            toast.success("Channel deleted")
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete")
        }
    }
    else if (action === "rename") {
      try {
        await api.put(
          `/workspace/${selectedWorkspace}/channel/${actionModalId}`,
          { channelname: newName },
          { headers: { token: token } }
        );
        setChannels(prevChannels =>
          prevChannels.map(channel => {
            if (channel.id === actionModalId) {
              return { ...channel, name: newName as string }; 
            }
            return channel;
          })
        );
        setChannelActionToggle(false);
        toast.success("Channel renamed")
      } catch (error) {
        console.log(error);
        toast.error("Failed to rename")
      }
    }
  }

  useEffect(() => {
    if (channelActionToggle) {
      setAction(null);
      setNewName(channel?.name||"");
    }
  }, [channelActionToggle, channel?.name]);

  return (
    <>
    {channelActionToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0a192f] rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold">
              {action === "delete" ? "Delete Item" : "Rename Item"}
            </h2>
          </div>
          <div className="p-4">
            {action === "delete" ? (
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete "{channel?.name}"? This action cannot
                be undone.
              </p>
            ) : (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#192e4a] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter new name"
              />
            )}
          </div>
          <div className="flex justify-end p-4 bg-[#0a192f] rounded-b-lg">
            <button
              onClick={()=>setChannelActionToggle(!channelActionToggle)}
              className="px-4 py-2 text-sm font-medium text-white hover:underline"
            >
              Cancel
            </button>
            {action === null ? (
              <>
                <button
                  onClick={() => setAction("rename")}
                  className="px-4 py-2 ml-2 text-sm font-medium text-white bg-customGreen hover:bg-green-700 rounded"
                >
                  Rename
                </button>
                <button
                  onClick={() => setAction("delete")}
                  className="px-4 py-2 ml-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleAction}
                className={`px-4 py-2 ml-2 text-sm font-medium text-white rounded ${
                  action === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-customGreen hover:bg-green-700"
                }`}
              >
                {action === "delete" ? "Delete" : "Rename"}
              </button>
            )}
          </div>
        </div>
      </div>
  
    )}
    </>
      );
};

export default ChannelActionModal;
