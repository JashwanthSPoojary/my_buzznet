import { FaClipboard } from "react-icons/fa";
import { api } from "../../../util/api";
import { token } from "../../../util/authenticated";
import { useState } from "react";
import { useAppStore, useWorkspaceStore } from "../../../stores";
import { toast } from "react-toastify";


const InviteModal = () => {
    const { inviteToggle,setInviteToggle} = useAppStore();
  const { selectedWorkspace } = useWorkspaceStore();
  const [inviteLink, setInviteLink] = useState<string>("");

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteLink) //change
      .then(() => {
        toast.success("intivation copied")
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to copy")
      });
  };
  const handleSubmit = async () => {
    try {
      const response = await api.post(
        `/workspace/${selectedWorkspace}/invite`,
        {},
        { headers: { token: token } }
      );
      console.log(response);
      setInviteLink(response.data.data);
      toast.success("Invitation generated")
    } catch (error) {
        toast.error("Failed to generate")
      console.log(error);
    }
  };

  return (
    <>
      {inviteToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div
            ref={() => {}}
            className="bg-[#0a192f] rounded-md shadow-xl w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-4 sm:p-6">
              <h2
                id="modal-title"
                className="text-xl font-bold mb-4 text-[#ffffff]"
              >
                Invite Members
              </h2>
              <div>
                <div className="mb-4">
                  <label
                    htmlFor="invite-link"
                    className="block text-sm font-medium text-[#b9bbbe] mb-2"
                  >
                    INVITE LINK
                  </label>
                  <div className="relative">
                    <input
                      ref={() => {}}
                      type="text"
                      id="invite-link"
                      value={inviteLink}
                      onChange={() => {}}
                      className="w-full px-3 py-2 bg-[#192e4a] border border-[#040405] rounded text-[#dcddde] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:border-transparent pr-10"
                      placeholder="Invite Link"
                      disabled
                      onClick={copyInviteLink}
                    />
                    <div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={copyInviteLink}
                    >
                      <FaClipboard className="text-gray-400" size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setInviteToggle(!inviteToggle)}
                    className="px-4 py-2 text-sm font-medium text-[#dcddde] bg-transparent hover:underline focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:ring-offset-2 focus:ring-offset-[#36393f]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="px-4 py-2 bg-[#3ba55c] text-white text-sm font-medium rounded hover:bg-[#2d7d46] focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:ring-offset-2 focus:ring-offset-[#36393f]"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InviteModal;
