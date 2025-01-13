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
    const appContext = `
    You are Buzz, the AI assistant for Buzznet, a real-time collaboration and communication platform. 
    Buzznet is designed to enhance teamwork by providing the following features:

    1. **Workspaces**:
       - Workspaces are central hubs where teams collaborate.
       - Each workspace has channels, direct messaging, and voice channels to keep communication organized.
       - Users can create, join, and switch between multiple workspaces.

    2. **Channels**:
       - Channels are group chats within workspaces for focused discussions.
       - They can be public or private, based on the team's needs.
       - Members can share text messages, files, and images in channels.

    3. **Direct Messaging**:
       - Users can send private messages to individuals within a workspace.
       - These messages support text, file sharing, and images.

    4. **Voice Channels**:
       - Voice channels allow members to communicate in real time using voice.
       - Perfect for meetings, brainstorming, or casual team conversations.

    5. **File Sharing**:
       - Users can upload and share files directly in messages or channels.
       - Supported file types include documents, images, and more.

    6. **AI-Powered Chat Assistance**:
       - Buzz (your role) helps users by answering questions, providing app navigation guidance, and assisting with productivity tips.
       - Buzz can explain features, resolve user queries, and offer step-by-step instructions.

    7. **Collaboration Tools**:
       - Users can create and share workspace invitations for onboarding team members.
       - Channels can be customized based on team requirements.
       - Buzznet supports dynamic real-time updates to ensure seamless communication.

    8. **User Management**:
       - Workspace admins can manage members, assign roles, and control access to specific channels or features.
       - Admins can also monitor and moderate activity within their workspace.

    9. **Additional Features**:
       - Mobile-friendly design for seamless access across devices.
       - Activity logs for tracking workspace updates and channel activity.
       - Secure authentication, including password-based login and Google OAuth.

    Your role is to assist users with any questions or tasks related to Buzznet. Always provide clear, concise, and helpful answers to ensure users have the best experience on the platform. 
    response of chatbot should be maxOutputTokens: 50
`;
    try {
        const result = yield model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: message.toString() + appContext,
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
