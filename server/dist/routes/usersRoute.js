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
const auth_1 = require("../middleware/auth");
const nodemailer_1 = __importDefault(require("nodemailer"));
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
const pgClient = new client_1.PrismaClient();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.EMAIL_USER,
        pass: config_1.APP_PASSWORD // Gmail App Password
    }
});
function sendOTP(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailOptions = {
            from: config_1.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `
        };
        transporter.sendMail(mailOptions);
    });
}
function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
userRouter.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.verifyOtp.safeParse(req.body);
    if (!validateSchema.success) {
        res.status(202).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    ;
    const { email, otp } = req.body;
    try {
        const verification = yield pgClient.emailVerification.findFirst({
            where: {
                email: email,
                otp: otp,
                expires_at: {
                    gt: new Date(),
                }
            }
        });
        if (!verification) {
            res.status(202).json({
                error: "Invalid or expired OTP"
            });
            return;
        }
        yield pgClient.users.create({
            data: {
                email: email,
                email_verified: true
            }
        });
        yield pgClient.emailVerification.delete({
            where: { email }
        });
        res.status(200).json({
            message: "Email verified successfully"
        });
    }
    catch (error) {
        console.log(error);
    }
}));
userRouter.post("/signupemail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validateSchema = validationSchema_1.signupEmailSchema.safeParse(req.body);
    console.log(validateSchema);
    if (!validateSchema.success) {
        res.status(202).json({
            error: validateSchema.error.errors[0].message,
        });
        return;
    }
    ;
    const { email } = req.body;
    try {
        const otp = generateOTP();
        const expireTime = new Date(Date.now() + 10 * 60 * 1000);
        const response = yield pgClient.users.findFirst({
            where: {
                email: email
            }
        });
        console.log(response);
        if (response) {
            console.log(response);
            res.status(202).json({
                error: "user already exists"
            });
            return;
        }
        yield pgClient.emailVerification.upsert({
            where: { email },
            update: {
                email: email,
                otp: otp,
                expires_at: expireTime
            },
            create: {
                email: email,
                otp: otp,
                expires_at: expireTime
            }
        });
        yield sendOTP(email, otp);
        res.status(200).json({
            message: "OTP sent successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to send OTP"
        });
        console.log(error);
    }
}));
userRouter.post("/signupusername", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    console.log(password);
    const password_hash = yield bcrypt_1.default.hash(password, 5);
    try {
        const workspace = yield pgClient.users.update({
            where: {
                email: email
            },
            data: {
                username: username,
                password_hash: password_hash
            }
        });
        if (!workspace) {
            res.status(202).json({
                error: "Failed to signup"
            });
        }
        res.status(200).json({
            message: "signed up"
        });
    }
    catch (error) {
        console.log(error);
    }
}));
userRouter.post("/checkemail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    try {
        const workspace = yield pgClient.users.findFirst({
            where: {
                email: email
            },
            select: {
                id: true,
                username: true,
            }
        });
        if (workspace === null || workspace === void 0 ? void 0 : workspace.username) {
            res.status(202).json({
                error: "no email id"
            });
            return;
        }
        if (!workspace) {
            res.status(202).json({
                error: "no email id"
            });
            return;
        }
        res.status(200).json({
            message: "valid email"
        });
    }
    catch (error) {
        console.log(error);
    }
}));
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
        if (password_hash === null)
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
        res.redirect(`${config_1.FRONTEND_URL}/error`);
    }
    else {
        res.redirect(`${config_1.FRONTEND_URL}/google/callback?token=${token}`);
    }
}));
userRouter.get('/userdetails', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user_id;
    try {
        const response = yield pgClient.users.findFirst({
            where: {
                id: userId
            }
        });
        res.status(201).json({
            message: "user datails fetched",
            data: response
        });
    }
    catch (error) {
        res.status(400).json({
            message: "error of userdetails",
        });
        console.log("userdetails : " + error);
    }
}));
userRouter.get('/invite/:token', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const userId = req.user_id;
    if (!userId) {
        res.status(201).json({
            error: "no user found"
        });
        return;
    }
    try {
        const invite = yield pgClient.workspace_invitation_links.findUnique({
            where: {
                token: token
            }
        });
        if (!invite) {
            res.status(201).json({ error: 'Invalid invite token.' });
            return;
        }
        const workspace = yield pgClient.workspaces.findUnique({ where: { id: invite.workspace_id } });
        const user = yield pgClient.users.findUnique({ where: { id: userId } });
        if (!workspace || !user) {
            res.status(201).json({ error: 'Invalid workspace or user.' });
            return;
        }
        const isMember = yield pgClient.workspace_members.findFirst({
            where: { workspace_id: workspace.id, user_id: user.id },
        });
        if (isMember) {
            res.status(201).json({ error: 'You are already a member of this workspace.' });
            return;
        }
        res.json({ message: "invite is valid", data: workspace.name });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
}));
userRouter.post('/invite/:token/accept', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const userId = req.user_id;
    if (!userId) {
        res.status(400).json({ error: 'no user found' });
        return;
    }
    try {
        const invite = yield pgClient.workspace_invitation_links.findUnique({ where: { token: token } });
        if (!invite) {
            res.status(201).json({ error: 'Invalid invite token.' });
            return;
        }
        const isMember = yield pgClient.workspace_members.findFirst({
            where: { workspace_id: invite.workspace_id, user_id: userId },
        });
        if (isMember) {
            res.status(201).json({ error: 'You are already a member of this workspace.' });
            return;
        }
        yield pgClient.workspace_members.create({
            data: { workspace_id: invite.workspace_id, user_id: userId },
        });
        res.json({ message: 'Successfully joined the workspace.' });
    }
    catch (error) {
        console.log("error");
        res.status(500).json({ error: 'Server error.' });
    }
}));
