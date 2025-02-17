import { FcGoogle as Google } from "react-icons/fc";
import { MdEmail as Email } from "react-icons/md";
import { Link } from "react-router-dom";
import env from "../../util/config";

const SignUp2 = () => {

  const handleGoogleLogin = () => {
    window.location.href = `${env.backend_url}/user/google`;
  };
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-b from-[#000000] to-[#0B192C] p-4">
      <div className="w-full max-w-md p-4 sm:p-6 md:p-8 rounded-lg bg-[#1E2A38] text-white shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
          Create an account
        </h1>
        <button
            onClick={handleGoogleLogin}
          className="w-full mt-4 bg-transparent border border-[#4f545c] text-white hover:bg-[#4f545c] py-2 px-4 rounded flex items-center justify-center transition-colors duration-200"
        >
          <Google className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Continue with Google
        </button>
        <Link
        to='/emailSignup'
          className="w-full mt-4 bg-transparent border border-[#4f545c] text-white hover:bg-[#4f545c] py-2 px-4 rounded flex items-center justify-center transition-colors duration-200"
        >
          <Email size={24}  className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Continue with Email
        </Link>
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

export default SignUp2;
