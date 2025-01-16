import { useState } from "react";
import { api, isAxios, AxiosErrorResponse } from "../../util/api";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle as Google } from "react-icons/fc";
import env from "../../util/config";

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/user/signup", {
        username,
        email,
        password,
      });
      if (response.status === 201) {
        navigate("/signin");
      }
    } catch (err) {
      if (isAxios(err)) {
        const errorMessage =
          (err.response?.data as AxiosErrorResponse)?.error ||
          "An unknown error occurred";
        setError(errorMessage);
      } else {
        setError("Error occured");
        console.log(error);
      }
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${env.backend_url}/user/google`;
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-b from-[#000000] to-[#0B192C] p-4">
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-lg bg-[#1E2A38] text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          Create an account
        </h1>
        {error && (
          <span className="text-[#f04747] text-sm mb-4 block text-center">
            {error}
          </span>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-[#b9bbbe] uppercase mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
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
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#5CB338] hover:bg-[#4AA12C] text-white py-2 px-4 rounded transition-colors duration-200"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-[#b9bbbe]">
          <span>Or</span>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 bg-transparent border border-[#4f545c] text-white hover:bg-[#4f545c] py-2 px-4 rounded flex items-center justify-center transition-colors duration-200"
        >
          <Google className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Continue with Google
        </button>
        <p className="mt-6 text-center text-xs sm:text-sm text-[#b9bbbe]">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#5CB338] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
