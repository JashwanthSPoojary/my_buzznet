import { useState } from "react";
import { api, isAxios, AxiosErrorResponse } from "../../util/api";
import { useNavigate, Link } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

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
        navigate("/");
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
    window.location.href = "http://localhost:3000/user/google";
  };
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-row">
      <div className="flex gap-4 flex-col justify-center items-center">
        <h1 className="font-semibold text-xl">Sign In</h1>
        {error === "" ? null : <span>{error}</span>}
        <form method="post" onSubmit={onSubmit}>
          <div className="flex flex-col gap-4 justify-center items-center">
            <input
              onChange={(e) => setEmail(e.target.value)}
              className="border border-black px-5 py-1"
              type="email"
              placeholder="youremail@gmail.com"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black px-5 py-1"
              type="password"
              placeholder="password"
            />
            <button className="border bg-black text-white rounded-lg px-6 py-2">
              Sign In
            </button>
          </div>
        </form>
        <p> or </p>
        <button
          onClick={handleGoogleLogin}
          className="border border-black px-5 py-1"
        >
          Google
        </button>
        <p>
          Don't have account ?{" "}
          <Link to="/signup">
            <span className="text-blue-600 cursor-pointer">Signup here</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
