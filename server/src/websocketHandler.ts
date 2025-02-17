import { Server, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";



interface CustomWebSocket extends WebSocket {
  channelId?: string;
  userId?: string;
  peerId?: string;
}
interface MessageHandlersProps {
  type:string;
  handler: (ws: CustomWebSocket, parsedMessage: any, wss: Server) => Promise<void>
}

const prisma = new PrismaClient();
const videoPeerIds:{ [key: string]: string } = {};
function getKeyByValue(obj: { [key: string]: string }, value: string): string | undefined {
  return Object.keys(obj).find((key) => obj[key] === value);
}

export const clients:Set<WebSocket> = new Set();

const MessageHandlers:MessageHandlersProps[] = [
  {
    type:"join-channel",
    handler: async (ws,message)=>{
      clients.add(ws);
      ws.channelId = message.channelId;
      console.log(`Client joined channel: ${ws.channelId}`);
    }
  },
  {
    type: "join-dm",
    handler: async (ws, message) => {
      ws.userId = message.userId;
      ws.peerId = message.peerId;
      console.log(`User ${ws.userId} joined DM with ${ws.peerId}`);
    }
  },
  {
    type: "join-video",
    handler: async (ws, message) => {
      videoPeerIds[message.videoUserId] = message.videoPeerId;
      console.log("Video call joined by " + message.videoPeerId);
    },
  },{
    type: "message",
    handler: async (ws, message, wss) => {
      if (!ws.channelId) return;

      const savedMessage = await prisma.channel_message.create({
        data: {
          channel_id: message.channelId,
          content: message.content,
          sender_id: message.userId,
          file_url: message.file || null,
        },
      });
      const sender = await prisma.users.findUnique({
        where: { id: message.userId },
        select: { username: true },
      });

      if (!sender) {
        console.error("Sender not found");
        return;
      }

      const enrichedMessage = {
        ...savedMessage,
        sender: { id: message.userId, username: sender.username },
        type: "message",
      };
      broadcastToChannel(wss, ws.channelId, enrichedMessage);
    }
  },{
    type: "dm",
    handler: async (ws, message, wss) => {
      if (!ws.userId || !ws.peerId) return;

      const savedMessage = await prisma.direct_messages.create({
        data: {
          sender_id: parseInt(ws.userId),
          receiver_id: parseInt(ws.peerId),
          content: message.content,
          workspace_id: parseInt(message.workspaceId),
          file_url: message.file || null,
        },
      });

      const sender = await prisma.users.findUnique({
        where: { id: message.userId },
        select: { username: true },
      });

      if (!sender) {
        console.error("Sender not found");
        return;
      }

      const enrichedMessage = {
        ...savedMessage,
        sender: { id: message.userId, username: sender.username },
        type: "dm",
      };

      broadcastToDM(wss, ws.userId, ws.peerId, enrichedMessage);
    },
  },{
    type: "request-peer-id",
    handler: async (ws, message) => {
      const videoPeerId = videoPeerIds[message.targetVideoUserId];
      ws.send(JSON.stringify({
        type: "response-peer-id",
        videoPeerId: videoPeerId
      }));
      console.log("Sent the response-peer-id " + videoPeerId);
    }
  },{
    type: "incomming-call",
    handler: async (ws, message, wss) => {
      broadcastToUser(wss, message.targetUserId, message);
    }
  }
  

];
function broadcastToChannel(wss: Server, channelId: string, message: any) {
  wss.clients.forEach((client: CustomWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.channelId === channelId) {
      client.send(JSON.stringify(message));
    }
  });
}
function broadcastToDM(wss: Server, userId: string, peerId: string, message: any) {
  wss.clients.forEach((client: CustomWebSocket) => {
    if (
      client.readyState === WebSocket.OPEN &&
      ((client.userId === peerId && client.peerId === userId) ||
        (client.userId === userId && client.peerId === peerId))
    ) {
      client.send(JSON.stringify(message));
    }
  });
}
function broadcastToUser(wss: Server, targetUserId: string, message: any) {
  wss.clients.forEach((client: CustomWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.userId === targetUserId) {
      client.send(JSON.stringify(message));
    }
  });
}




export function initializeWebSocketServer(server: any) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: CustomWebSocket) => {
    console.log("Client connected");
    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        const handler = MessageHandlers.find(h=>h.type === parsedMessage.type);
        if(handler){
          handler?.handler(ws,parsedMessage,wss);
        }        
      } catch (error) {
        console.error("Error parsing message:", error);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws.on("close", () => {
      console.log("Client disconnected");
      clients.delete(ws);
    });
  });
}
