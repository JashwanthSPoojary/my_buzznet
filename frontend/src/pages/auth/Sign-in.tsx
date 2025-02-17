import { useState } from "react";
import { api, isAxios, AxiosErrorResponse } from "../../util/api";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { token } from "../../util/authenticated";
import env from "../../util/config";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isGoogleDirecting, setIsGoogleDirecting] = useState<boolean>(false);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/user/signin", {
        email,
        password,
      });
      if (response) {
        localStorage.setItem("buzznettoken", response.data.token);
      }
      if (response.status === 201) {
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
      }
    } catch (err) {
      if (isAxios(err)) {
        const errorMessage =
          (err.response?.data as AxiosErrorResponse)?.error ||
          "An unknown error occurred";
        setError(errorMessage);
      } else {
        setError("Error occured");
        console.log(err);
      }
    }
  };
  const handleGoogleLogin = () => {
    setIsGoogleDirecting(true);
    window.location.href = `${env.backend_url}/user/google`;
  };
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-b from-[#000000] to-[#0B192C] p-4">
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-lg bg-[#1E2A38] text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          Welcome back!
        </h1>
        {error && (
          <span className="text-[#f04747] text-sm mb-4 block text-center">
            {error}
          </span>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#b9bbbe] uppercase mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#b9bbbe] uppercase mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#5CB338] hover:bg-[#4AA12C] text-white py-2 px-4 rounded transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-[#b9bbbe]">
          <span>Or</span>
        </div>
        <button
          disabled={isGoogleDirecting}
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-transparent border border-[#4f545c] text-white hover:bg-[#4f545c] py-2 px-4 rounded flex items-center justify-center transition-colors duration-200"
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
        <p className="mt-6 text-center text-xs sm:text-sm text-[#b9bbbe]">
          Need an account?{" "}
          <Link to="/signup" className="text-[#5CB338] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
