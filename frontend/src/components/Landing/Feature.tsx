import { FaBriefcase, FaUsers, FaRegCommentDots, FaEnvelope, FaVideo, FaDesktop } from 'react-icons/fa';

const features = [
  {
    icon: FaBriefcase,
    title: "Workspace Creation",
    description: "Easily set up and manage workspaces to bring your team together."
  },
  {
    icon: FaUsers,
    title: "Channel Creation",
    description: "Organize discussions with channels tailored to topics or teams."
  },
  {
    icon: FaRegCommentDots,
    title: "Group Chats",
    description: "Stay connected with your team through real-time group chats."
  },
  {
    icon: FaEnvelope,
    title: "Direct Messages",
    description: "Communicate privately with team members, one-on-one."
  },
  {
    icon: FaVideo,
    title: "Video Calling",
    description: "Host video calls to connect and collaborate with your team."
  },
  {
    icon: FaDesktop,
    title: "AI Assistance",
    description: "Leverage AI tools to streamline your workflow and productivity."
  }
];

const Feature = () => {
    return ( 
        <section className="bg-gradient-to-b from-[#0B192C] to-[#000000]  py-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#4CAF50] text-4xl md:text-5xl font-bold mb-4 font-heading">
            Features 
          </h2>
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto font-sans">
            This are some of the features that i was able to build in the time . My thought out some essential features . 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-sm rounded-lg p-6 
                        transform transition-all duration-300 ease-in-out
                        hover:scale-105 hover:bg-black/60 hover:shadow-lg hover:shadow-[#4CAF50]/10
                        border border-transparent hover:border-[#4CAF50]/20"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-[#4CAF50]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-semibold mb-2 font-heading">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
     );
}
 
export default Feature;