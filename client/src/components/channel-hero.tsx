import { FaHashtag, FaUserFriends } from "react-icons/fa";

interface ChannelHeroProps {
  channelName: string | undefined;
}

const ChannelHero = ({ channelName }: ChannelHeroProps) => {
  return (
    <div className="bg-gradient-to-r from-[#36393F] to-[#36393F] text-white p-6 border-b border-gray-700">
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-700 rounded-full p-2">
            <FaHashtag className="text-green-400 text-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-xl md:text-2xl hover:text-green-400 transition duration-300">
            {channelName}
          </h1>
        </div>
        <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-4 py-2 mt-3 sm:mt-0">
          <FaUserFriends className="text-green-400 text-lg" />
          <span className="text-sm font-medium">All members</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-400 max-w-2xl sm:text-xs md:text-sm lg:text-base sm:w-full md:w-3/4 lg:w-full">
        Welcome to #{channelName}! This channel is for all things related to{" "}
        {channelName}. Feel free to ask questions, share ideas, and collaborate
        with other members.
      </p>
    </div>
  );
};

export default ChannelHero;
