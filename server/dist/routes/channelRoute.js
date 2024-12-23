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
exports.channelRouter.use("/:workspace_id/channel/", messageRoute_1.messageRouter);
