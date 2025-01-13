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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validationSchema_1 = require("../middleware/validationSchema");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const websocketHandler_1 = require("../websocketHandler");
const ws_1 = require("ws");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileExtension = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only images are allowed."));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});
const pgClient = new client_1.PrismaClient();
exports.messageRouter = (0, express_1.Router)();
exports.messageRouter.post("/:channel_id/message/create", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.messageSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const user_id = req.user_id;
    const { content } = req.body;
    const channel_id = parseInt(req.params.channel_id);
    if (!user_id) {
        res.status(400).json({
            error: "no user found",
        });
        return;
    }
    try {
        const response = yield pgClient.channel_message.create({
            data: {
                content: content,
                channel_id: channel_id,
                sender_id: user_id,
            },
        });
        res.status(201).json({
            message: "message created",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to create message",
        });
    }
}));
exports.messageRouter.get("/:channel_id/getmessages", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    const channel_id = parseInt(req.params.channel_id);
    try {
        const response = yield pgClient.channel_message.findMany({
            where: {
                channel_id: channel_id,
            },
            include: {
                sender: true,
            },
        });
        res.status(201).json({
            message: "message fetched",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch messages",
        });
    }
}));
exports.messageRouter.delete("/:channelId/message/:messageId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const messageId = parseInt(req.params.messageId);
    const channelId = parseInt(req.params.channelId);
    try {
        if (!channelId) {
            res.status(201).json({ error: "channel not found" });
            return;
        }
        const deletedMessage = yield pgClient.channel_message.delete({
            where: { id: messageId },
        });
        websocketHandler_1.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "messageDeleted", messageId: messageId }));
            }
        });
        if (!deletedMessage) {
            res.status(201).json({ error: "Message not found" });
            return;
        }
        res.status(200).json({ message: "Message deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete message" });
    }
}));
exports.messageRouter.post("/:channel_id/message/upload", upload.single("file"), auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded or invalid file type" });
        return;
    }
    res.json({
        message: "Image uploaded successfully",
        filePath: `/uploads/${req.file.filename}`,
    });
}));
