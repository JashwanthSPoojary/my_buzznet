import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth, CustomRequest } from "../middleware/auth";
import { messageSchema } from "../middleware/validationSchema";

const pgClient = new PrismaClient();
export const dmRouter = Router();

dmRouter.post(
  "/:workspaceId/message/create",
  auth,
  async (req: CustomRequest, res) => {
    const validateSchema = messageSchema.safeParse(req.body);
    if (!validateSchema.success) {
      res.status(400).json({
        error: validateSchema.error.errors[0].message,
      });
      return;
    }
    const { receiver_id } = req.body;
    const user_id = req.user_id;
    const { content } = req.body;
    const workspaceId = parseInt(req.params.workspaceId);
    if (!user_id) {
      res.status(400).json({
        error: "no user found",
      });
      return;
    }
    try {
      const response = await pgClient.direct_messages.create({
        data: {
          content: content,
          workspace_id: workspaceId,
          sender_id: user_id,
          receiver_id: receiver_id,
        },
      });
      res.status(201).json({
        message: "message created",
        data: response,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to create message",
      });
    }
  }
);
dmRouter.post(
  "/:workspaceId/getmessages",
  auth,
  async (req: CustomRequest, res) => {
    const { sender_id, receiver_id } = req.body;
    const user_id = req.user_id;
    if (!user_id) {
      res.status(400).json({
        error: "no user is found",
      });
      return;
    }
    const workspaceId = parseInt(req.params.workspaceId);
    try {
      const response = await pgClient.direct_messages.findMany({
        where: {
          OR:[
            {sender_id: sender_id,receiver_id: receiver_id},
            {sender_id:receiver_id,receiver_id:sender_id}
          ]
        },
        include:{
          sender:{
            select:{
              username:true
            }
          }
        },
        orderBy:{created_at:"asc"},
      });
      res.status(201).json({
        message: "message fetched",
        data: response,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to fetch messages",
      });
    }
  }
);
