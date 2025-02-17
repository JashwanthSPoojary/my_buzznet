import Peer from "peerjs";

export const createPeerInstance = (userId?: string) => {
  if (!userId) {
    throw new Error("User ID is required to create a Peer instance.");
  }

  const peer = new Peer(userId, {
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    },
    debug: 3, // Log everything (for debugging)
  });

  // Add general error listener
  peer.on('error', (error) => {
    console.error('Peer connection error:', error);
  });

  // Add disconnected listener
  peer.on('disconnected', () => {
    console.log('Peer disconnected');
    peer.reconnect();
  });

  // Add close listener
  peer.on('close', () => {
    console.log('Peer connection closed');
  });

  return peer;
};