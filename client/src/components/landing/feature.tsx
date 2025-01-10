import { FaBriefcase, FaUsers, FaRegCommentDots, FaEnvelope, FaVideo, FaDesktop } from 'react-icons/fa';

const features = [
    {
      icon: FaBriefcase,
      title: "Workspace Creation",
      description: "Create and customize your team workspace with powerful organization tools"
    },
    {
      icon: FaUsers,
      title: "Channel Creation",
      description: "Organize conversations by topics, projects, or teams with dedicated channels"
    },
    {
      icon: FaRegCommentDots,
      title: "Group Chats",
      description: "Collaborate seamlessly with team members in real-time group discussions"
    },
    {
      icon: FaEnvelope,
      title: "Direct Messages",
      description: "Private, secure one-on-one conversations with team members"
    },
    {
      icon: FaVideo,
      title: "Video Calling",
      description: "Crystal-clear video conferences with screen sharing capabilities"
    },
    {
      icon: FaDesktop,
      title: "AI Assistance",
      description: "Smart assistance powered by AI to boost your productivity"
    }
  ]
const Feature = () => {
    return ( 
        <section className="bg-gradient-to-b from-[#0B192C] to-[#000000]  py-20 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[#4CAF50] text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto">
            Experience next-level team collaboration with our comprehensive suite of features
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
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
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