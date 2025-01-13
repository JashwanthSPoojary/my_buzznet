import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(80vh-4rem)] bg-gradient-to-b from-[#000000] to-[#0B192C] text-white px-4 pt-16">
      <motion.h1
        className="text-6xl md:text-8xl font-extrabold mb-6 text-center leading-tight tracking-wide"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        Welcome to <span className="text-[#5CB338]">BuzzNet</span>
      </motion.h1>
      <motion.p
        className="text-lg md:text-2xl text-center max-w-4xl font-medium leading-relaxed tracking-wide"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4 }}
      >
        Buzznet is designed as a powerful collaboration platform, enabling users to create and manage workspaces for effective team communication. 
      </motion.p>
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      >
        <button className="bg-[#5CB338] text-[#000000] text-lg md:text-xl font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-[#4AA62B] transition duration-300">
          Get Started
        </button>
      </motion.div>
    </div>
  );
};

export default Hero;
