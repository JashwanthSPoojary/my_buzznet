import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { createModalSchema } from "../middleware/validationSchema";
import { PrismaClient } from "@prisma/client";

const pgClient = new PrismaClient();
export const channelRouter = Router();


channelRouter.post("/:workspace_id/channel/create", auth, async (req: CustomRequest, res) => {
    const validateSchema = createModalSchema.safeParse(req.body);
    if (!validateSchema.success) {
      res.status(400).json({
        error_message: "failed to create workspace",
        error: validateSchema.error.errors,
      });
      return;
    }
    const { name } = req.body;
    console.log(name);
    
    const workspace_id = parseInt(req.params.workspace_id)

    console.log(workspace_id);
    try {
      const workspace = await pgClient.workspaces.findUnique({
        where:{
            id:workspace_id
        }
      })
      if(!workspace){
        res.status(400).json({
            error_message: "failed to create channel",
            error: "workspace id not found",
          });
          return
      }
      await pgClient.channels.create({
        data: {
          name: name,
          workspace_id:workspace_id,
        },
      });
      res.status(201).json({
        message: "channel created",
      });
    } catch (error) {
      res.status(400).json({
        error_message: "failed to create channel database",
        error: error,
      });
    }
  });
  
