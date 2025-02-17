import { useEffect, useState } from "react";
import { api } from "../../util/api";
import { useNavigate, useParams } from "react-router-dom";

const EmailForm = () => {
  const { email } = useParams();
  const [username, setUsername] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const validation = (): boolean => {
    if (username == "" || username.length < 3) {
      setError("incorrect username");
      return false;
    }
    if (password !== confirmPassword) {
      setError("password does not match");
      return false;
    }

    const age = calculateAge(dob);
    if (!email) {
      return false;
    }
    if (age < 13) {
      setError("should be above 13 years old");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validation()) return;
    try {
      console.log("here");
      const response = await api.post("/user/signupusername", {
        username: username,
        email: email,
        password: password,
      });
      console.log(response);
      if (response.status === 202) {
        setError(response.data.error);
        return;
      }
      if (response.status === 200) {
        navigate("/signin");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Something went wrong. Please try again.");
    }
  };
  useEffect(() => {
    const checkEmail = async () => {
      if (email) {
        try {
          const res = await api.post("/user/checkemail", {
            email: email,
          });
          if (res.status === 202) {
            await navigate("/signup");
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    checkEmail();
  }, [email, navigate]);
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-b from-[#000000] to-[#0B192C] p-4">
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-lg bg-[#1E2A38] text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          User Details
        </h1>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
              htmlFor="dob"
              className="block text-xs font-medium text-[#b9bbbe] uppercase mb-2"
            >
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
              required
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
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-medium text-[#b9bbbe] uppercase mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Enter a confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#16222E] border-none text-white placeholder-[#72767d] focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SignUp
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailForm;
