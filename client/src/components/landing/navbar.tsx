import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isSticky ? "bg-[#000000]/90 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a
          href="/"
          className="text-[#5CB338] text-3xl font-extrabold tracking-wider font-heading"
        >
          Buzz<span className="text-white">Net</span>
        </a>
        <div className="hidden md:flex space-x-4">
          <Link
            to="/signin"
            className="px-6 py-2 text-[#5CB338] border-2 border-[#5CB338] rounded-full font-semibold hover:bg-[#5CB338] hover:text-[#000000] transition-all duration-300 transform hover:scale-105 font-sans"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-[#5CB338] text-[#000000] border-2 border-[#5CB338] rounded-full font-semibold hover:bg-transparent hover:text-[#5CB338] transition-all duration-300 transform hover:scale-105 font-sans"
          >
            Sign Up
          </Link>
        </div>
        <button
          className="md:hidden text-[#5CB338] focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-[#000000]/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button className="w-full px-6 py-2 text-[#5CB338] border-2 border-[#5CB338] rounded-full font-semibold hover:bg-[#5CB338] hover:text-[#000000] transition-all duration-300 font-heading">
              Sign In
            </button>
            <button className="w-full px-6 py-2 bg-[#5CB338] text-[#000000] border-2 border-[#5CB338] rounded-full font-semibold hover:bg-transparent hover:text-[#5CB338] transition-all duration-300 font-heading">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
