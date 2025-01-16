import Peer from "peerjs";

export const createPeerInstance =  (userId?: string) => {

   if (!userId) {
    throw new Error("User ID is required to create a Peer instance.");
  }
    
  return  new Peer(userId+"");
};
