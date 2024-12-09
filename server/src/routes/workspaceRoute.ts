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
      error_message: "failed to create workspace",
      error: validateSchema.error.errors,
    });
    return;
  }
  const { name } = req.body;
  const user_id = req.user_id;
  if (!user_id) {
    res.status(400).json({
      error_message: "failed to create workspace",
      error: "no user is found",
    });
    return;
  }
  try {
    await pgClient.workspaces.create({
      data: {
        name: name,
        owner_id: user_id,
      },
    });
    res.status(201).json({
      message: "workspace created",
    });
  } catch (error) {
    res.status(400).json({
      error_message: "failed to create workspace database",
      error: error,
    });
  }
});

workspaceRouter.use('/',channelRouter)
