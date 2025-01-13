import { useState } from "react";
import { UseChannelContext } from "../../context/channelContext";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";
import { UseWorkspaceContext } from "../../context/workspaceContext";

interface ChannelModalProps {
  channelModalToggle: boolean;
  setchannelModalToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelModal = ({
  channelModalToggle,
  setchannelModalToggle,
}: ChannelModalProps) => {
  const { setChannels } = UseChannelContext();
  const { selectedWorkspace } = UseWorkspaceContext();
  const [name, setName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/workspace/${selectedWorkspace}/channel/create`,
        { name: name },
        { headers: { token: token } }
      );
      setChannels((prev) => [...prev, response.data.data]);
      setName("");
      setchannelModalToggle(!channelModalToggle);
    } catch (error) {
      console.log("WorkspaceModal error : " + error);
    }
  };

  return (
    <>
      {channelModalToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div
            ref={() => {}}
            className="bg-[#36393f] rounded-md shadow-xl w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-4 sm:p-6">
              <h2
                id="modal-title"
                className="text-xl font-bold mb-4 text-[#ffffff]"
              >
                Create New Channel
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="workspace-name"
                    className="block text-sm font-medium text-[#b9bbbe] mb-2"
                  >
                    CHANNEL NAME
                  </label>
                  <input
                    ref={() => {}}
                    type="text"
                    id="channel-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#202225] border border-[#040405] rounded text-[#dcddde] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:border-transparent"
                    placeholder="Enter channel name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setchannelModalToggle(!channelModalToggle)}
                    className="px-4 py-2 text-sm font-medium text-[#dcddde] bg-transparent hover:underline focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:ring-offset-2 focus:ring-offset-[#36393f]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3ba55c] text-white text-sm font-medium rounded hover:bg-[#2d7d46] focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:ring-offset-2 focus:ring-offset-[#36393f]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChannelModal;
