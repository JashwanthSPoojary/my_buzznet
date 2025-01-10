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
exports.dmRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const validationSchema_1 = require("../middleware/validationSchema");
const pgClient = new client_1.PrismaClient();
exports.dmRouter = (0, express_1.Router)();
exports.dmRouter.post("/:workspaceId/message/create", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.messageSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const { receiver_id } = req.body;
    const user_id = req.user_id;
    const { content } = req.body;
    const workspaceId = parseInt(req.params.workspaceId);
    if (!user_id) {
        res.status(400).json({
            error: "no user found",
        });
        return;
    }
    try {
        const response = yield pgClient.direct_messages.create({
            data: {
                content: content,
                workspace_id: workspaceId,
                sender_id: user_id,
                receiver_id: receiver_id,
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
exports.dmRouter.post("/:workspaceId/getmessages", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sender_id, receiver_id } = req.body;
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    const workspaceId = parseInt(req.params.workspaceId);
    try {
        const response = yield pgClient.direct_messages.findMany({
            where: {
                OR: [
                    { sender_id: sender_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id }
                ]
            },
            include: {
                sender: {
                    select: {
                        username: true
                    }
                }
            },
            orderBy: { created_at: "asc" },
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
