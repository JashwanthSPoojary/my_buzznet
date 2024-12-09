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
const pgClient = new client_1.PrismaClient();
exports.channelRouter = (0, express_1.Router)();
exports.channelRouter.post("/:workspace_id/channel/create", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.createModalSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error_message: "failed to create workspace",
            error: validateSchema.error.errors,
        });
        return;
    }
    const { name } = req.body;
    console.log(name);
    const workspace_id = parseInt(req.params.workspace_id);
    console.log(workspace_id);
    try {
        const workspace = yield pgClient.workspaces.findUnique({
            where: {
                id: workspace_id
            }
        });
        if (!workspace) {
            res.status(400).json({
                error_message: "failed to create channel",
                error: "workspace id not found",
            });
            return;
        }
        yield pgClient.channels.create({
            data: {
                name: name,
                workspace_id: workspace_id,
            },
        });
        res.status(201).json({
            message: "channel created",
        });
    }
    catch (error) {
        res.status(400).json({
            error_message: "failed to create channel database",
            error: error,
        });
    }
}));
