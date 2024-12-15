import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { createModalSchema } from "../middleware/validationSchema";
import { PrismaClient } from "@prisma/client";
import { messageRouter } from "./messageRoute";

const pgClient = new PrismaClient();
export const channelRouter = Router();

channelRouter.post("/:workspace_id/channel/create", auth, async (req: CustomRequest, res) => {
    const validateSchema = createModalSchema.safeParse(req.body);
    if (!validateSchema.success) {
      res.status(400).json({
        error: validateSchema.error.errors[0].message,
      });
      return;
    }
    const { name } = req.body;
    
    const workspace_id = parseInt(req.params.workspace_id)

    try {
      const workspace = await pgClient.workspaces.findUnique({
        where:{
            id:workspace_id
        }
      })
      if(!workspace){
        res.status(400).json({
            error: "workspace id not found",
          });
          return
      }
      const response = await pgClient.channels.create({
        data: {
          name: name,
          workspace_id:workspace_id,
        },
      });
      res.status(201).json({
        message: "channel created",
        data:response
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to create workspace",
      });
    }
  });
channelRouter.get(
  "/:workspace_id/channel/getchannels",
  auth,
  async (req: CustomRequest, res) => {
    const user_id = req.user_id;
    if (!user_id) {
      res.status(400).json({
        error: "no user is found",
      });
      return;
    }
    const workspace_id = parseInt(req.params.workspace_id)
    try {
      const response = await pgClient.channels.findMany({
        where: {
          workspace_id: workspace_id,
        },
      });
      res.status(201).json({
        message: "channels fetched",
        data: response,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to fetch channels",
      });
    }
  }
);
  
channelRouter.use("/:workspace_id/channel/", messageRouter);
