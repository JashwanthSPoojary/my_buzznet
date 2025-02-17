import { useEffect, useState } from "react";
import { api } from "../../../util/api";
import { token } from "../../../util/authenticated";
import { useAppStore, useWorkspaceStore } from "../../../stores";
import { toast } from "react-toastify";

interface Owner {
    id: number;
    created_at: Date;
    username: string;
    email: string | null;
    password_hash: string;
}
interface Workspace {
    name: string;
    id: number;
    owner_id: number;
    owner: Owner;
}

const WorkspaceModal = () => {
  const {workspaces,setWorkspaces,setSelectedWorkspace} = useWorkspaceStore();
  const { setworkspaceModalToggle,workspaceModalToggle } = useAppStore();
  const [name, setName] = useState<string>("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await api.post(
          "/workspace/create",
          { name: name },
          { headers: { token: token } }
        );
        const newWorkspace: Workspace = response.data.data;
        setWorkspaces((prev) => [...prev, newWorkspace]);
        setSelectedWorkspace(response.data.data.id);
        setName("");
        setworkspaceModalToggle(false);
        toast.success("Workspace created")
      } catch (error) {
        console.error("WorkspaceModal error : " + error);
        toast.error("Failed to create")
      }
      
  };
  useEffect(() => {
    if (workspaces.length === 0) {
      setworkspaceModalToggle(true);
    } else {
      setworkspaceModalToggle(false);
    }
  }, [workspaces, setworkspaceModalToggle]);
  

  return (
    <>
      {workspaceModalToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div
            className="bg-[#0a192f]  rounded-md shadow-xl w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="p-4 sm:p-6">
              <h2
                id="modal-title"
                className="text-xl font-bold mb-4 text-[#ffffff]"
              >
                Create New Workspace
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="workspace-name"
                    className="block text-sm font-medium text-[#b9bbbe] mb-2"
                  >
                    WORKSPACE NAME
                  </label>
                  <input
                    ref={() => {}}
                    type="text"
                    id="workspace-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#192e4a] border border-[#040405] rounded text-[#dcddde] placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:border-transparent"
                    placeholder="Enter workspace name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    disabled={workspaces.length ===0 ?true :false}
                    type="button"
                    onClick={() =>
                      setworkspaceModalToggle(false)
                    }
                    className="px-4 py-2 text-sm font-medium text-[#dcddde] bg-transparent hover:underline focus:outline-none focus:ring-2 focus:ring-[#3ba55c] focus:ring-offset-2 focus:ring-offset-[#36393f]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!name.trim()}
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

export default WorkspaceModal;
