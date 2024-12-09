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
exports.userRouter = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const passport_1 = __importDefault(require("passport"));
const validationSchema_1 = require("../middleware/validationSchema");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const pgClient = new client_1.PrismaClient();
userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.userSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error_message: "failed to sign up",
            error: validateSchema.error.errors,
        });
        return;
    }
    const { username, password } = req.body;
    const password_hash = yield bcrypt_1.default.hash(password, 5);
    try {
        yield pgClient.users.create({
            data: {
                username: username,
                password_hash: password_hash,
            },
        });
        res.status(201).json({
            message: "user signed up",
        });
    }
    catch (error) {
        res.status(400).json({
            error_message: "failed to sign up",
            error: error,
        });
    }
}));
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.userSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error_message: "failed to sign in",
            error: validateSchema.error.errors,
        });
        return;
    }
    const { username, password } = req.body;
    try {
        const response = yield pgClient.users.findUnique({
            where: {
                username: username,
            },
        });
        if (response === null) {
            res.status(400).json({
                error_message: "failed to sign in",
                error: "username is wrong",
            });
            return;
        }
        const password_hash = response === null || response === void 0 ? void 0 : response.password_hash;
        const user_id = response === null || response === void 0 ? void 0 : response.id;
        if (password_hash === undefined)
            return;
        const validPassword = yield bcrypt_1.default.compare(password, password_hash);
        if (!validPassword) {
            res.status(400).json({
                error_message: "failed to sign in",
                error: "password is wrong",
            });
            return;
        }
        if (config_1.JWT_SECRET === undefined)
            return;
        const token = yield jsonwebtoken_1.default.sign({
            user_id: user_id,
        }, config_1.JWT_SECRET);
        res.status(201).json({
            message: "user signed in",
            token: token,
        });
    }
    catch (error) {
        res.status(400).json({
            error_message: "failed to sign in",
            error: error,
        });
    }
}));
userRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
userRouter.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    res.json({ token: (_a = req.user) === null || _a === void 0 ? void 0 : _a.token });
}));
