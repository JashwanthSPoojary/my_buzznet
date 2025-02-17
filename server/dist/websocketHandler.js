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
function getKeyByValue(obj, value) {
    return Object.keys(obj).find((key) => obj[key] === value);
}
exports.clients = new Set();
const MessageHandlers = [
    {
        type: "join-channel",
        handler: (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
            exports.clients.add(ws);
            ws.channelId = message.channelId;
            console.log(`Client joined channel: ${ws.channelId}`);
        })
    },
    {
        type: "join-dm",
        handler: (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
            ws.userId = message.userId;
            ws.peerId = message.peerId;
            console.log(`User ${ws.userId} joined DM with ${ws.peerId}`);
        })
    },
    {
        type: "join-video",
        handler: (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
            videoPeerIds[message.videoUserId] = message.videoPeerId;
            console.log("Video call joined by " + message.videoPeerId);
        }),
    }, {
        type: "message",
        handler: (ws, message, wss) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ws.channelId)
                return;
            const savedMessage = yield prisma.channel_message.create({
                data: {
                    channel_id: message.channelId,
                    content: message.content,
                    sender_id: message.userId,
                    file_url: message.file || null,
                },
            });
            const sender = yield prisma.users.findUnique({
                where: { id: message.userId },
                select: { username: true },
            });
            if (!sender) {
                console.error("Sender not found");
                return;
            }
            const enrichedMessage = Object.assign(Object.assign({}, savedMessage), { sender: { id: message.userId, username: sender.username }, type: "message" });
            broadcastToChannel(wss, ws.channelId, enrichedMessage);
        })
    }, {
        type: "dm",
        handler: (ws, message, wss) => __awaiter(void 0, void 0, void 0, function* () {
            if (!ws.userId || !ws.peerId)
                return;
            const savedMessage = yield prisma.direct_messages.create({
                data: {
                    sender_id: parseInt(ws.userId),
                    receiver_id: parseInt(ws.peerId),
                    content: message.content,
                    workspace_id: parseInt(message.workspaceId),
                    file_url: message.file || null,
                },
            });
            const sender = yield prisma.users.findUnique({
                where: { id: message.userId },
                select: { username: true },
            });
            if (!sender) {
                console.error("Sender not found");
                return;
            }
            const enrichedMessage = Object.assign(Object.assign({}, savedMessage), { sender: { id: message.userId, username: sender.username }, type: "dm" });
            broadcastToDM(wss, ws.userId, ws.peerId, enrichedMessage);
        }),
    }, {
        type: "request-peer-id",
        handler: (ws, message) => __awaiter(void 0, void 0, void 0, function* () {
            const videoPeerId = videoPeerIds[message.targetVideoUserId];
            ws.send(JSON.stringify({
                type: "response-peer-id",
                videoPeerId: videoPeerId
            }));
            console.log("Sent the response-peer-id " + videoPeerId);
        })
    }, {
        type: "incomming-call",
        handler: (ws, message, wss) => __awaiter(void 0, void 0, void 0, function* () {
            broadcastToUser(wss, message.targetUserId, message);
        })
    }
];
function broadcastToChannel(wss, channelId, message) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN && client.channelId === channelId) {
            client.send(JSON.stringify(message));
        }
    });
}
function broadcastToDM(wss, userId, peerId, message) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN &&
            ((client.userId === peerId && client.peerId === userId) ||
                (client.userId === userId && client.peerId === peerId))) {
            client.send(JSON.stringify(message));
        }
    });
}
function broadcastToUser(wss, targetUserId, message) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN && client.userId === targetUserId) {
            client.send(JSON.stringify(message));
        }
    });
}
function initializeWebSocketServer(server) {
    const wss = new ws_1.WebSocket.Server({ server });
    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedMessage = JSON.parse(message.toString());
                const handler = MessageHandlers.find(h => h.type === parsedMessage.type);
                if (handler) {
                    handler === null || handler === void 0 ? void 0 : handler.handler(ws, parsedMessage, wss);
                }
            }
            catch (error) {
                console.error("Error parsing message:", error);
                ws.send(JSON.stringify({ error: "Invalid message format" }));
            }
        }));
        ws.on("close", () => {
            console.log("Client disconnected");
            exports.clients.delete(ws);
        });
    });
}
