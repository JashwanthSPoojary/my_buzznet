import { Server, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";



interface CustomWebSocket extends WebSocket {
  channelId?: string;
  userId?: string;
  peerId?: string;
}

const prisma = new PrismaClient();
const videoPeerIds:{ [key: string]: string } = {};

export const clients:Set<WebSocket> = new Set();


export function initializeWebSocketServer(server: any) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: CustomWebSocket) => {
    console.log("Client connected");
    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "join-channel") {
          clients.add(ws);
          console.log("added");
          ws.channelId = parsedMessage.channelId;
          console.log(`Client joined channel: ${ws.channelId}`);
          return;
        }

        if (parsedMessage.type === "join-dm") {
          ws.userId = parsedMessage.userId;
          ws.peerId = parsedMessage.peerId;
          console.log(`User ${ws.userId} joined DM with ${ws.peerId}`);
          return;
        }

        if (parsedMessage.type === "message" && ws.channelId) {
          const savedMessage = await prisma.channel_message.create({
            data: {
              channel_id: parsedMessage.channelId,
              content: parsedMessage.content,
              sender_id: parsedMessage.userId,
              file_url: parsedMessage.file || null,
            },
          });

          const sender = await prisma.users.findUnique({
            where: { id: parsedMessage.userId },
            select: { username: true },
          });

          if (!sender) {
            console.error("Sender not found");
            return;
          }

          const enrichedMessage = {
            ...savedMessage,
            sender: { id: parsedMessage.userId, username: sender.username },
            type: "message",
          };

          wss.clients.forEach((client) => {
            const customClient = client as CustomWebSocket;
            if (
              customClient.readyState === WebSocket.OPEN &&
              customClient.channelId === ws.channelId
            ) {
              customClient.send(JSON.stringify(enrichedMessage));
            }
          });
          return;
        }

        if (parsedMessage.type === "dm" && ws.userId && ws.peerId) {
          const savedMessage = await prisma.direct_messages.create({
            data: {
              sender_id: parseInt(ws.userId),
              receiver_id: parseInt(ws.peerId),
              content: parsedMessage.content,
              workspace_id: parseInt(parsedMessage.workspaceId),
              file_url: parsedMessage.file || null,
            },
          });

          const sender = await prisma.users.findUnique({
            where: { id: parsedMessage.userId },
            select: { username: true },
          });

          if (!sender) {
            console.error("Sender not found");
            return;
          }

          const enrichedMessage = {
            ...savedMessage,
            sender: { id: parsedMessage.userId, username: sender.username },
            type: "dm",
          };

          wss.clients.forEach((client) => {
            const customClient = client as CustomWebSocket;
            if (
              customClient.readyState === WebSocket.OPEN &&
              ((customClient.userId === ws.peerId &&
                customClient.peerId === ws.userId) ||
                (customClient.userId === ws.userId &&
                  customClient.peerId === ws.peerId))
            ) {
              customClient.send(JSON.stringify(enrichedMessage));
            }
          });
          return;
        }
        if(parsedMessage.type === "join-video"){
          videoPeerIds[parsedMessage.videoUserId] = parsedMessage.videoPeerId;
          console.log("video call joined by"+parsedMessage.videoPeerId);
        }
        if(parsedMessage.type === "request-peer-id"){
          const videoPeerId = videoPeerIds[parsedMessage.targetVideoUserId];
          ws.send(JSON.stringify({
            type:"response-peer-id",
            videoPeerId:videoPeerId
          }))
          console.log("sended the response-peer-id"+videoPeerId);
        }
        if(parsedMessage.type === "incomming-call"){
          wss.clients.forEach((client) => {
            const customClient = client as CustomWebSocket;
            if (customClient.readyState === WebSocket.OPEN && customClient.userId === parsedMessage.targetUserId){
              console.log(parsedMessage);
              customClient.send(JSON.stringify(parsedMessage));
            }
          });
        }
        
      } catch (error) {
        console.error("Error parsing message:", error);
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
}
