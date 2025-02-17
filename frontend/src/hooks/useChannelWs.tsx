import { useEffect } from "react";
import { useWebsocketStore } from "../stores/slices/ws-slice";

const useChannelWs = (url: string, selectedChannel: number | undefined) => {
    const { connect, disconnect, sendMessage } = useWebsocketStore();
    useEffect(() => {
        if (!selectedChannel) return;

    // Connect WebSocket when `selectedChannel` changes
    connect(url, (ws) => {
      // Optional: Send a join-channel message when WebSocket connects
      ws.send(
        JSON.stringify({ type: "join-channel", channelId: selectedChannel })
      );
    });

    // Cleanup WebSocket on unmount or when `selectedChannel` changes
    return () => {
      disconnect();
    };
    },[
        connect, disconnect, url, selectedChannel
    ]);
    return  { sendMessage }
}

export default useChannelWs;