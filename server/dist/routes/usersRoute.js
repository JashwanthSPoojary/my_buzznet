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
    var _a, _b, _c;
    const validateSchema = validationSchema_1.signupSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const { username, email, password } = req.body;
    const password_hash = yield bcrypt_1.default.hash(password, 5);
    try {
        yield pgClient.users.create({
            data: {
                username: username,
                email: email,
                password_hash: password_hash,
            },
        });
        res.status(201).json({
            message: "user signed up",
        });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" &&
            Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) &&
            ((_c = (_b = error.meta) === null || _b === void 0 ? void 0 : _b.target) === null || _c === void 0 ? void 0 : _c.includes("username"))) {
            res.status(409).json({
                error: "User already exists",
            });
        }
        else {
            res.status(500).json({
                error: "Failed to sign up",
                err: error,
            });
        }
    }
}));
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.signinSchema.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(400).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    const { email, password } = req.body;
    try {
        const response = yield pgClient.users.findUnique({
            where: {
                email: email,
            },
        });
        if (response === null) {
            res.status(400).json({
                error: "Incorrect email",
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
                error: "Incorrect password",
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
            error: error,
        });
    }
}));
userRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
userRouter.get("/google/callback", passport_1.default.authenticate("google", { session: false, failureRedirect: "/" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.user) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        res.redirect(`http://localhost:5173/signin`);
    }
    else {
        res.redirect(`http://localhost:5173/google/callback?token=${token}`);
    }
}));
