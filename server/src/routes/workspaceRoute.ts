import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { createModalSchema } from "../middleware/validationSchema";
import { channelRouter } from "./channelRoute";

const pgClient = new PrismaClient();

export const workspaceRouter = Router();

workspaceRouter.post("/create", auth, async (req: CustomRequest, res) => {
  const validateSchema = createModalSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  }
  const { name } = req.body;
  const user_id = req.user_id;
  if (!user_id) {
    res.status(400).json({
      error: "no user is found",
    });
    return;
  }
  try {
    const response = await pgClient.workspaces.create({
      data: {
        name: name,
        owner_id: user_id,
      },
    });
    res.status(201).json({
      message: "workspace created",
      data:response
    });
  } catch (error) {
    res.status(400).json({
      error: "failed to create workspace",
    });
  }
});
workspaceRouter.get(
  "/getworkspaces",
  auth,
  async (req: CustomRequest, res) => {
    const user_id = req.user_id;
    if (!user_id) {
      res.status(400).json({
        error: "no user is found",
      });
      return;
    }
    try {
      const response = await pgClient.workspaces.findMany({
        where: {
          owner_id: user_id,
        },
      });
      res.status(201).json({
        message: "workspace fetched",
        data: response,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to fetch workspace",
      });
    }
  }
);

workspaceRouter.get(
  "/:workspaceId",
  auth,
  async (req: CustomRequest, res) => {
    const user_id = req.user_id;
    const workspaceId = parseInt(req.params.workspaceId);
    if (!user_id) {
      res.status(400).json({
        error: "no user is found",
      });
      return;
    }
    try {
      const workspace = await pgClient.workspaces.findUnique({
        where: {
          id: workspaceId, 
        },
        include: {
          channels: true, 
          workspace_members: true,
        },
      });
      res.status(200).json({
        message: "Workspace details fetched successfully",
        data: workspace,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to fetch workspace details",
      });
    }
  }
);


workspaceRouter.use("/", channelRouter);
