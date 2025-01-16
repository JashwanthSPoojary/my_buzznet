"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clients = void 0;
exports.initializeWebSocketServer = initializeWebSocketServer;
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const videoPeerIds = {};
exports.clients = new Set();
function initializeWebSocketServer(server) {
    const wss = new ws_1.WebSocket.Server({ server });
    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedMessage = JSON.parse(message.toString());
                if (parsedMessage.type === "join-channel") {
                    exports.clients.add(ws);
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
                if (parsedMessage.type === "join-video") {
                    videoPeerIds[parsedMessage.videoUserId] = parsedMessage.videoPeerId;
                    console.log("video call joined by" + parsedMessage.videoPeerId);
                }
                if (parsedMessage.type === "message" && ws.channelId) {
                    const savedMessage = yield prisma.channel_message.create({
                        data: {
                            channel_id: parsedMessage.channelId,
                            content: parsedMessage.content,
                            sender_id: parsedMessage.userId,
                            file_url: parsedMessage.file || null,
                        },
                    });
                    const sender = yield prisma.users.findUnique({
                        where: { id: parsedMessage.userId },
                        select: { username: true },
                    });
                    if (!sender) {
                        console.error("Sender not found");
                        return;
                    }
                    const enrichedMessage = Object.assign(Object.assign({}, savedMessage), { sender: { id: parsedMessage.userId, username: sender.username }, type: "message" });
                    wss.clients.forEach((client) => {
                        const customClient = client;
                        if (customClient.readyState === ws_1.WebSocket.OPEN &&
                            customClient.channelId === ws.channelId) {
                            customClient.send(JSON.stringify(enrichedMessage));
                        }
                    });
                    return;
                }
                if (parsedMessage.type === "dm" && ws.userId && ws.peerId) {
                    const savedMessage = yield prisma.direct_messages.create({
                        data: {
                            sender_id: parseInt(ws.userId),
                            receiver_id: parseInt(ws.peerId),
                            content: parsedMessage.content,
                            workspace_id: parseInt(parsedMessage.workspaceId),
                            file_url: parsedMessage.file || null,
                        },
                    });
                    const sender = yield prisma.users.findUnique({
                        where: { id: parsedMessage.userId },
                        select: { username: true },
                    });
                    if (!sender) {
                        console.error("Sender not found");
                        return;
                    }
                    const enrichedMessage = Object.assign(Object.assign({}, savedMessage), { sender: { id: parsedMessage.userId, username: sender.username }, type: "dm" });
                    wss.clients.forEach((client) => {
                        const customClient = client;
                        if (customClient.readyState === ws_1.WebSocket.OPEN &&
                            ((customClient.userId === ws.peerId &&
                                customClient.peerId === ws.userId) ||
                                (customClient.userId === ws.userId &&
                                    customClient.peerId === ws.peerId))) {
                            customClient.send(JSON.stringify(enrichedMessage));
                        }
                    });
                    return;
                }
                if (parsedMessage.type === "request-peer-id") {
                    const videoPeerId = videoPeerIds[parsedMessage.targetVideoUserId];
                    ws.send(JSON.stringify({
                        type: "response-peer-id",
                        videoPeerId: videoPeerId
                    }));
                    console.log("sended the response-peer-id" + videoPeerId);
                }
                if (parsedMessage.type === "incomming-call") {
                    wss.clients.forEach((client) => {
                        const customClient = client;
                        if (customClient.readyState === ws_1.WebSocket.OPEN && customClient.userId === parsedMessage.targetUserId) {
                            console.log(parsedMessage);
                            customClient.send(JSON.stringify(parsedMessage));
                        }
                    });
                }
            }
            catch (error) {
                console.error("Error parsing message:", error);
                ws.send(JSON.stringify({ error: "Invalid message format" }));
            }
        }));
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });
}
