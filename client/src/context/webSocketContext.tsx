import React, { createContext, useContext, useEffect, useState } from "react";

type WebSocketContextType = {
  ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws,setWs] = useState<WebSocket|null>(null)
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    socket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };
    setWs(socket)
    return () => {
        socket.close();
    };
  }, []);
  return (
    <WebSocketContext.Provider value={{ ws: ws }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
      throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
