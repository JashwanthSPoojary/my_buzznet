import { useEffect, useState } from "react";
import { UseWorkspaceContext } from "../../context/workspaceContext";
import { api } from "../../util/api";
import { token } from "../../util/authenticated";

interface WorkspaceActionModalProps {
  workspaceActionToggle: boolean;
  setWorkspaceActionToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorkspaceActionModal = ({
  workspaceActionToggle,
  setWorkspaceActionToggle,
}: WorkspaceActionModalProps) => {
  const { selectedWorkspace, workspaces, setWorkspaces } =
    UseWorkspaceContext();
  const workspace = workspaces.find(
    (workspace) => workspace.id === selectedWorkspace
  );
  const [newName, setNewName] = useState(workspace?.name);
  const [action, setAction] = useState<"delete" | "rename" | null>(null);

  const handleAction = async () => {
    if (action === "delete") {
      try {
        const response = await api.delete(`/workspace/${selectedWorkspace}`, {
          headers: { token: token },
        });
        setWorkspaces((prevWorkspace) =>
          prevWorkspace.filter(
            (workspace) => workspace.id !== selectedWorkspace
          )
        );
        console.log(response.data.message);
        setWorkspaceActionToggle(!workspaceActionToggle);
      } catch (error) {
        console.log(error);
      }
    } else if (action === "rename") {
      try {
        const response = await api.put(
          `/workspace/${selectedWorkspace}`,
          { workspacename: newName },
          { headers: { token: token } }
        );
        setWorkspaces(prevWorkspaces =>
          prevWorkspaces.map(workspace => {
            if (workspace.id === selectedWorkspace) {
              return { ...workspace, name: newName as string }; 
            }
            return workspace;
          })
        );
        console.log(response.data.message);
        setWorkspaceActionToggle(!workspaceActionToggle);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (workspaceActionToggle) {
      setAction(null);
      setNewName(workspace?.name);
    }
  }, [workspaceActionToggle, workspace?.name]);

  return (
    <>
      {workspaceActionToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#36393f] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">
                {action === "delete" ? "Delete Item" : "Rename Item"}
              </h2>
            </div>
            <div className="p-4">
              {action === "delete" ? (
                <p className="text-gray-300 mb-4">
                  Are you sure you want to delete "{workspace?.name}"? This
                  action cannot be undone.
                </p>
              ) : (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#40444b] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter new name"
                />
              )}
            </div>
            <div className="flex justify-end p-4 bg-[#2f3136] rounded-b-lg">
              <button
                onClick={() => setWorkspaceActionToggle(!workspaceActionToggle)}
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

export default WorkspaceActionModal;
