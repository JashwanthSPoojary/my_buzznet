import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { messageSchema } from "../middleware/validationSchema";
import { PrismaClient } from "@prisma/client";

const pgClient = new PrismaClient();
export const messageRouter = Router();

messageRouter.post("/:channel_id/message/create",auth, async (req:CustomRequest,res)=>{
    const validateSchema = messageSchema.safeParse(req.body);
    if (!validateSchema.success) {
      res.status(400).json({
        error: validateSchema.error.errors[0].message,
      });
      return;
    }
    const user_id = req.user_id;
    const { content } = req.body;
    const channel_id = parseInt(req.params.channel_id);
    if(!user_id){
        res.status(400).json({
            error: "no user found",
          });
          return
    }
    try {
        const response = await pgClient.channel_message.create({
            data:{
                content:content,
                channel_id:channel_id,
                user_id:user_id
            }
        })
        res.status(201).json({
            message: "message created",
            data:response
        });
    } catch (error) {
        res.status(400).json({
            error: "failed to create message",
        });
    }

})
messageRouter.get("/:channel_id/getmessages",auth, async (req:CustomRequest,res)=>{
    const user_id = req.user_id;
    if (!user_id) {
      res.status(400).json({
        error: "no user is found",
      });
      return;
    }
    const channel_id = parseInt(req.params.channel_id);
    try {
        const response = await pgClient.channel_message.findMany({
            where: {
              channel_id: channel_id,
            },
        });
        res.status(201).json({
            message: "messages fetched",
            data: response,
        });
    } catch (error) {
        res.status(400).json({
            error: "failed to fetch messages",
          });
    }

})