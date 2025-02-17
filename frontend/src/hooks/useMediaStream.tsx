import { useEffect, useState } from "react";

export const useLocalMediaStream = () => {
  const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  // Cleanup media stream when component using this hook unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return { localStream, getLocalStream, setLocalStream };
};
