import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI("AIzaSyCYjNxmtTK6t8QgV_lFwfF_dnafz_Qpa_8");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export const chatbotRouter = Router();
const pgClient = new PrismaClient();


chatbotRouter.post('/chatbot',auth,async (req: CustomRequest, res) => {
    const { message } = req.body;
    const userId = req.user_id;
    if(!userId){
        res.status(400).json({ error: "user not found" });
        return
    }
    if (!message) {
        res.status(400).json({ error: "Message is required." });
        return
    }
    try {

        const result = await model.generateContent({
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
        res.status(200).json({ data:chatbotResponse });
    } catch (error) {

        
    }
})