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
exports.workspaceRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const validationSchema_1 = require("../middleware/validationSchema");
const channelRoute_1 = require("./channelRoute");
const uuid_1 = require("uuid");
const config_1 = require("../utils/config");
const dmRoute_1 = require("./dmRoute");
const pgClient = new client_1.PrismaClient();
exports.workspaceRouter = (0, express_1.Router)();
exports.workspaceRouter.post("/create", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.createModalSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const { name } = req.body;
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    try {
        const response = yield pgClient.workspaces.create({
            data: {
                name: name,
                owner_id: user_id,
                channels: {
                    create: {
                        name: "General",
                    }
                }
            },
        });
        yield pgClient.workspace_members.create({
            data: {
                user_id: response.owner_id,
                workspace_id: response.id
            }
        });
        res.status(201).json({
            message: "workspace created",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to create workspace",
        });
    }
}));
exports.workspaceRouter.get("/getworkspaces", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user_id;
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    try {
        const ownedWorkspaces = yield pgClient.workspaces.findMany({
            where: {
                owner_id: user_id,
            },
            include: {
                owner: {
                    select: {
                        id: true
                    }
                }
            }
        });
        const joinedWorkspaces = yield pgClient.workspaces.findMany({
            where: {
                workspace_members: {
                    some: {
                        user_id: user_id,
                    },
                },
            },
            include: {
                owner: {
                    select: {
                        id: true
                    }
                }
            }
        });
        const workspacemap = new Map();
        [...ownedWorkspaces, ...joinedWorkspaces].forEach((workspace) => {
            workspacemap.set(workspace.id, workspace);
        });
        const allWorkspaces = Array.from(workspacemap.values());
        res.status(201).json({
            message: "workspace fetched",
            data: allWorkspaces,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch workspace",
        });
    }
}));
exports.workspaceRouter.get('/workspaceIds', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_id;
    try {
        if (!userId)
            throw new Error("no user id");
        const response = yield pgClient.workspaces.findFirst({
            where: {
                owner_id: userId
            },
            select: {
                id: true
            }
        });
        if (!response) {
            const workspace = yield pgClient.workspaces.create({
                data: {
                    name: "general",
                    owner_id: userId,
                    channels: {
                        create: {
                            name: "General",
                        }
                    }
                },
            });
            res.status(200).json({
                message: "workspace id is fetched",
                data: workspace.id
            });
            return;
        }
        res.status(200).json({
            message: "workspace id is fetched",
            data: response
        });
    }
    catch (error) {
        console.log("error in workspace id is fetched");
        console.log(error);
    }
}));
exports.workspaceRouter.get("/:workspaceId", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.user_id;
    const workspaceId = parseInt(req.params.workspaceId);
    if (!user_id) {
        res.status(400).json({
            error: "no user is found",
        });
        return;
    }
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: {
                id: workspaceId,
            },
            include: {
                channels: true,
                workspace_members: true,
            },
        });
        res.status(200).json({
            message: "Workspace details fetched successfully",
            data: workspace,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch workspace details",
        });
    }
}));
exports.workspaceRouter.post("/:workspaceId/invite", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("here");
    const workspaceId = parseInt(req.params.workspaceId);
    const userId = req.user_id;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (!userId) {
        res.status(400).json({
            message: "no user found",
        });
        return;
    }
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: { id: workspaceId },
            include: { owner: true },
        });
        if ((workspace === null || workspace === void 0 ? void 0 : workspace.owner_id) !== userId) {
            res.status(403).json({ message: "Only the owner can invite users." });
            return;
        }
        const token = (0, uuid_1.v4)();
        yield pgClient.workspace_invitation_links.create({
            data: {
                workspace_id: workspaceId,
                token: token,
                created_by: userId,
                expiresAt: expiresAt,
            },
        });
        // make it env
        const inviteUrl = `${config_1.FRONTEND_URL}/invite/${token}`;
        res.status(200).json({
            message: "Invitation link generated successfully",
            data: inviteUrl,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create invitation link." });
    }
}));
exports.workspaceRouter.get("/:workspaceId/members", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workspaceId = parseInt(req.params.workspaceId);
    try {
        const members = yield pgClient.workspace_members.findMany({
            where: { workspace_id: workspaceId },
            include: {
                user: { select: { id: true, username: true, email: true } },
            },
        });
        const memberdata = members.map((member) => member.user);
        res.json({
            message: "members fetched",
            data: memberdata,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch workspace members" });
    }
}));
exports.workspaceRouter.delete('/:workspaceId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield pgClient.workspaces.delete({
            where: { id: workspaceId },
        });
        res.status(200).json({ message: "workspace deleted " });
    }
    catch (error) {
        console.error("Error deleting workspace:", error);
        res.status(500).json({ error: "Failed to delete workspace" });
    }
}));
exports.workspaceRouter.put('/:workspaceId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.workspacename;
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
        yield pgClient.workspaces.update({
            where: { id: workspaceId },
            data: {
                name: name
            }
        });
        res.status(200).json({ message: "workspace updated " });
    }
    catch (error) {
        console.error("Error updating workspace:", error);
        res.status(500).json({ error: "Failed to update workspace" });
    }
}));
exports.workspaceRouter.use("/", dmRoute_1.dmRouter);
exports.workspaceRouter.use("/", channelRoute_1.channelRouter);
