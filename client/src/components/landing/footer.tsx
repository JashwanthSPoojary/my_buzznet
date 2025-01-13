import { FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
    return ( 
        <footer className="bg-gradient-to-b from-[#000000] to-[#0B192C] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Buzznet</h2>
            <p className="text-xl text-gray-300">A real-time communication platform</p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-end space-y-4 md:space-y-0 md:space-x-6">
            <Link 
              to="/signin" 
              className="text-gray-300 hover:text-white transition-colors duration-200 text-lg font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-green-500 to-green-600 
                        hover:from-green-600 hover:to-green-700 
                        text-white px-6 py-2 rounded-md text-lg font-medium 
                        transition-all duration-200 hover:shadow-lg 
                        hover:shadow-green-500/20 text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-1 mb-4 md:mb-0">
            <span className="text-gray-300">Made with</span>
            <FaHeart className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-gray-300">in {new Date().getFullYear()}</span>
          </div>
          <nav className="flex items-center space-x-4">
            <div  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
              Privacy Policy
            </div>
            <div  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
              Terms of Service
            </div>
          </nav>
        </div>
      </div>
    </footer>
     );
}
 
export default Footer;