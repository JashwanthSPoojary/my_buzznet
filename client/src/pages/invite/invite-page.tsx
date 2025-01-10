import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { token } from "../../util/authenticated";
import { api } from "../../util/api";

const InvitePage = () => {
  const { invitetoken } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await api.post(
        `/user/invite/${invitetoken}/accept`,
        {},
        { headers: { token: token } }
      );
      if (response.data.error) {
        setError(response.data.error || "Failed to join workspace");
        return;
      }
      const firstWorkspaceId = await api.get("/workspace/workspaceIds", {
        headers: { token: token },
      });
      if (!firstWorkspaceId) {
        throw new Error("not able to get first workspace");
      }
      const firstChannelId = await api.get(
        `/workspace/${firstWorkspaceId.data.data.id}/channel/channelIds`,
        { headers: { token: token } }
      );
      if (!firstChannelId) {
        throw new Error("not able to get first channel");
      }
      navigate(
        `/workspaces/${firstWorkspaceId.data.data.id}/channels/${firstChannelId.data.data.id}`,
        { replace: true }
      );

    } catch (error) {
      console.log(error);
      setError("Failed to join workspace");
    }
  };

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!token) {
        navigate(`/signin?redirect=/invite/${invitetoken}`);
        return;
      }
      try {
        const response = await api.get(`/user/invite/${invitetoken}`, {
          headers: { token: token },
        });
        if (response.data.error) {
          setError(response.data.error || "Invalid invite.");
          setLoading(false);
          return;
        }
        setName(response.data.data);
      } catch (error) {
        setError("Server error");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInviteDetails();
  }, [navigate, invitetoken]);
  if (loading) return <div>...loading</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="min-h-screen bg-[#23272A] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#2C2F33] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white mb-6">
            You've been invited to join
          </h1>
          <div className="bg-[#36393F] rounded-md p-4 mb-6 flex items-center">
            <div className="w-12 h-12 bg-customGreen rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
              W
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{name}</h2>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="block w-full bg-customGreen hover:bg-green-800 transition-colors duration-200 text-white font-medium py-3 px-4 rounded-md text-center"
          >
            Join Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
