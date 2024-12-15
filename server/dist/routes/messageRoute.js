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
exports.messageRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validationSchema_1 = require("../middleware/validationSchema");
const client_1 = require("@prisma/client");
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
                user_id: user_id
            }
        });
        res.status(201).json({
            message: "message created",
            data: response
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
        });
        res.status(201).json({
            message: "messages fetched",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch messages",
        });
    }
}));
