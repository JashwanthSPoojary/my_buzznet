import { MdCall, MdCallEnd } from 'react-icons/md';
import { useCallStore,useAcceptCall } from '../../stores';


const CallNotification = () => {
  const { showIncomingCall,rejectIncomingCall} = useCallStore();
  const acceptIncomingCall = useAcceptCall();


  if (!showIncomingCall) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 rounded-lg p-4 shadow-lg z-50 w-80">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-white font-medium">Incoming video call...</p>
        <div className="flex space-x-4">
          <button
            onClick={acceptIncomingCall}
            className="p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors"
          >
            <MdCall className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={rejectIncomingCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          >
            <MdCallEnd className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;