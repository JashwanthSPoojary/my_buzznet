import { useNavigate } from "react-router-dom";

interface LogoutProps {
  logoutToggle: boolean;
  setLogoutToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logout = ({ logoutToggle, setLogoutToggle }: LogoutProps) => {
    const navigate = useNavigate();
    const handleSubmit = () => {
        localStorage.removeItem("buzznettoken");
        navigate('/signin');
    }
  return (
    <>
      {logoutToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#36393f] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">Log Out</h2>
              <button
                onClick={() => setLogoutToggle(!logoutToggle)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-300 mb-4">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setLogoutToggle(!logoutToggle)}
                  className="bg-[#2f3136] hover:bg-[#36393f] text-white font-medium py-2 px-4 rounded transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition duration-200"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;
