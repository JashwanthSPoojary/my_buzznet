import { create } from "zustand";

interface WebsocketStore {
    ws:WebSocket|null;
    connect:(url:string,handleOpen?:(ws:WebSocket)=>void)=>void;
    disconnect:()=>void;
    sendMessage:(message:string)=>void
};

export const useWebsocketStore = create<WebsocketStore>((set)=>({
    ws:null,
    connect:(url:string,handleOpen?:(ws:WebSocket)=>void)=>{
        const socket = new WebSocket(url);
        socket.onopen = () => {
            console.log("WebSocket connected");
            if(handleOpen){
                handleOpen(socket);
            }
          };
      
          socket.onclose = () => {
            console.log("WebSocket disconnected");
          };
      
          socket.onerror = (error) => {
            console.error("WebSocket error: ", error);
          };
        set({
            ws:socket
        })
    },
    disconnect:()=>{
        set((state)=>{
            if(state.ws){
                state.ws.close();
                console.log("Websocket closed");
            }
            return ({ws:null})
        })
    },
    sendMessage:(message)=>{
        set((state)=>{
            if(state.ws?.readyState===WebSocket.OPEN){
                state.ws.send(message)
            }else {
                console.error("WebSocket is not open");
            }
            return state;
        })
    }
}))