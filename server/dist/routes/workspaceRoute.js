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
            },
        });
        res.status(201).json({
            message: "workspace created",
            data: response
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
        const response = yield pgClient.workspaces.findMany({
            where: {
                owner_id: user_id,
            },
        });
        res.status(201).json({
            message: "workspace fetched",
            data: response,
        });
    }
    catch (error) {
        res.status(400).json({
            error: "failed to fetch workspace",
        });
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
exports.workspaceRouter.use("/", channelRoute_1.channelRouter);
