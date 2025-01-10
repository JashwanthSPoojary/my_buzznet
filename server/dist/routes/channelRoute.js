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
exports.channelRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validationSchema_1 = require("../middleware/validationSchema");
const client_1 = require("@prisma/client");
const messageRoute_1 = require("./messageRoute");
const pgClient = new client_1.PrismaClient();
exports.channelRouter = (0, express_1.Router)();
exports.channelRouter.post("/:workspace_id/channel/create", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.createModalSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const { name } = req.body;
    const workspace_id = parseInt(req.params.workspace_id);
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: {
                id: workspace_id
            }
        });
        if (!workspace) {
            res.status(400).json({
                error: "workspace id not found",
            });
            return;
        }
        const response = yield pgClient.channels.create({
            data: {
                name: name,
                workspace_id: workspace_id,
            },
        });
        res.status(201).json({
            message: "channel created",
            data: response
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to create workspace",
        });
    }
}));
exports.channelRouter.get("/:workspace_id/channel/getchannels", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    const workspace_id = parseInt(req.params.workspace_id);
    try {
        const response = yield pgClient.channels.findMany({
            where: {
                workspace_id: workspace_id,
            },
        });
        res.status(201).json({
            message: "channels fetched",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch channels",
        });
    }
}));
exports.channelRouter.get('/:workspace_id/channel/channelIds', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspace_id = parseInt(req.params.workspace_id);
    try {
        const response = yield pgClient.channels.findFirst({
            where: {
                workspace_id: workspace_id
            },
            select: {
                id: true
            }
        });
        res.status(200).json({
            message: "first channel id is fetched",
            data: response
        });
    }
    catch (error) {
        console.log("error in first channel id is fetched");
        console.log(error);
    }
}));
exports.channelRouter.delete('/:workspaceId/channel/:channelId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = parseInt(req.params.channelId);
    const workspaceId = parseInt(req.params.workspaceId);
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: {
                id: workspaceId
            }
        });
        if (!workspace) {
            res.status(201).json({ error: "workspace not found" });
            return;
        }
        const existingChannel = yield pgClient.channels.findUnique({
            where: { id: channelId },
        });
        if (!existingChannel) {
            res.status(201).json({ error: "Channel not found" });
            return;
        }
        yield pgClient.channels.delete({
            where: { id: channelId },
        });
        res.status(200).json({ message: "Channel deleted" });
    }
    catch (error) {
        console.error("Error deleting channel:", error);
        res.status(500).json({ error: "Failed to delete channel" });
    }
}));
exports.channelRouter.put('/:workspaceId/channel/:channelId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = parseInt(req.params.channelId);
    const workspaceId = parseInt(req.params.workspaceId);
    const name = req.body.channelname;
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: {
                id: workspaceId
            }
        });
        if (!workspace) {
            res.status(201).json({ error: "workspace not found" });
            return;
        }
        const existingChannel = yield pgClient.channels.findUnique({
            where: { id: channelId },
        });
        if (!existingChannel) {
            res.status(201).json({ error: "Channel not found" });
            return;
        }
        yield pgClient.channels.update({
            where: { id: channelId },
            data: {
                name: name
            }
        });
        res.status(200).json({ message: "Channel updated" });
    }
    catch (error) {
        console.error("Error updating channel:", error);
        res.status(500).json({ error: "Failed to update channel" });
    }
}));
exports.channelRouter.post('/:workspace_id/voicechannel/create', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspace_id = parseInt(req.params.workspace_id);
    const name = req.body.name;
    const userId = req.user_id;
    if (!name || !workspace_id || !userId) {
        res.status(400).json({ error: "Name and workspaceId and userId are required." });
        return;
    }
    try {
        const newChannel = yield pgClient.voiceChannel.create({
            data: {
                name: name,
                workspaceId: workspace_id,
                creatorId: userId,
            },
        });
        res.status(201).json({
            message: "channel created",
            data: newChannel
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to create workspace",
        });
    }
}));
exports.channelRouter.get("/:workspace_id/voicechannel/getvoicechannels", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    const workspace_id = parseInt(req.params.workspace_id);
    try {
        const response = yield pgClient.voiceChannel.findMany({
            where: {
                workspaceId: workspace_id,
            },
        });
        res.status(201).json({
            message: "voice channels fetched",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch channels",
        });
    }
}));
exports.channelRouter.post("/:workspace_id/voicechannel/join", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const channelId = parseInt(req.body.channelId);
    const workspace_id = parseInt(req.params.workspace_id);
    const userId = req.user_id;
    if (!userId || !channelId || !workspace_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    try {
        const response = yield pgClient.voiceChannel.update({
            where: {
                id: channelId,
                workspaceId: workspace_id
            },
            data: {
                members: {
                    connect: { id: userId }
                }
            },
            include: {
                members: true
            }
        });
        res.status(200).json({
            message: "Joined the channel successfully.",
            data: response
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error joining the voice channel." });
    }
}));
exports.channelRouter.get("/:workspace_id/voicechannel/participants/:voiceChannelId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const voiceChannelId = parseInt(req.params.voiceChannelId);
    const userId = req.user_id;
    if (!userId) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    try {
        const response = yield pgClient.users.findMany({
            where: {
                voicechannels: {
                    some: { id: voiceChannelId },
                },
            },
            select: {
                id: true,
            },
        });
        res.status(201).json({
            message: "all participants fetched",
            data: response
        });
    }
    catch (error) {
        res.status(500).json({
            error: "server error",
        });
    }
}));
exports.channelRouter.use("/:workspace_id/channel/", messageRoute_1.messageRouter);
