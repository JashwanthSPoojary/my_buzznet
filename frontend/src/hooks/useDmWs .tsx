import { useEffect } from "react";
import { useWebsocketStore } from "../stores/slices/ws-slice";

const useDmWs = (url: string,userId:number | undefined, selectedMember: number | undefined) => {
    const { connect, disconnect, sendMessage } = useWebsocketStore();
    useEffect(() => {
        if (!selectedMember) return;

    connect(url, (ws) => {
      ws.send(
        JSON.stringify({ type: "join-dm", userId: userId , peerId:selectedMember})
      );
    });

    return () => {
      disconnect();
    };
    },[
        connect, disconnect, url,selectedMember,userId
    ]);
    return  { sendMessage }
}

export default useDmWs;