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
exports.chatbotRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI("AIzaSyCYjNxmtTK6t8QgV_lFwfF_dnafz_Qpa_8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
exports.chatbotRouter = (0, express_1.Router)();
const pgClient = new client_1.PrismaClient();
exports.chatbotRouter.post('/chatbot', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    const userId = req.user_id;
    if (!userId) {
        res.status(400).json({ error: "user not found" });
        return;
    }
    if (!message) {
        res.status(400).json({ error: "Message is required." });
        return;
    }
    try {
        const result = yield model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: message.toString(),
                        }
                    ],
                }
            ],
            generationConfig: {
                maxOutputTokens: 50,
                temperature: 0.1,
            }
        });
        const chatbotResponse = result.response.text();
        res.status(200).json({ data: chatbotResponse });
    }
    catch (error) {
    }
}));
