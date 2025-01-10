import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import { createModalSchema } from "../middleware/validationSchema";
import { channelRouter } from "./channelRoute";
import { v4 as uuidv4 } from "uuid";
import { FRONTEND_URL } from "../utils/config";
import { dmRouter } from "./dmRoute";

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
        channels:{
          create:{
            name:"General",
          }
        }
      },
    });
    await pgClient.workspace_members.create({
      data:{
        user_id:response.owner_id,
        workspace_id:response.id
      }
    });
    res.status(201).json({
      message: "workspace created",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      error: "failed to create workspace",
    });
  }
});
workspaceRouter.get("/getworkspaces", auth, async (req: CustomRequest, res) => {
  const user_id = req.user_id;
  if (!user_id) {
    res.status(400).json({
      error: "no user is found",
    });
    return;
  }
  try {
    const ownedWorkspaces = await pgClient.workspaces.findMany({
      where: {
        owner_id: user_id,
      },
      include:{
        owner:{
          select:{
            id:true
          }
        }
      }
    });
    const joinedWorkspaces = await pgClient.workspaces.findMany({
      where: {
        workspace_members: {
          some: {
            user_id: user_id,
          },
        },
      },
      include:{
        owner:{
          select:{
            id:true
          }
        }
      }
    });
    const workspacemap = new Map();
    [...ownedWorkspaces, ...joinedWorkspaces].forEach((workspace) => {
      workspacemap.set(workspace.id, workspace);
    });
    const allWorkspaces = Array.from(workspacemap.values());

    res.status(201).json({
      message: "workspace fetched",
      data: allWorkspaces,
    });
  } catch (error) {
    res.status(400).json({
      error: "failed to fetch workspace",
    });
  }
});
workspaceRouter.get('/workspaceIds',auth,async (req: CustomRequest, res) => {
  const userId = req.user_id;
  try {
    if(!userId) throw new Error("no user id")

    const response = await pgClient.workspaces.findFirst({
      where:{
        owner_id:userId
      },
      select:{
        id:true
      }
    });
    if(!response){
      const workspace = await pgClient.workspaces.create({
        data: {
          name: "general",
          owner_id: userId,
          channels:{
            create:{
              name:"General",
            }
          }
        },
      });
      res.status(200).json({
        message:"workspace id is fetched",
        data:workspace.id
    });
    return
    }
    res.status(200).json({
        message:"workspace id is fetched",
        data:response
    });
  } catch (error) {
    console.log("error in workspace id is fetched");
    console.log(error);
  }
})

workspaceRouter.get("/:workspaceId", auth, async (req: CustomRequest, res) => {
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
});
workspaceRouter.post(
  "/:workspaceId/invite",
  auth,
  async (req: CustomRequest, res) => {
    console.log("here");

    const workspaceId = parseInt(req.params.workspaceId);
    const userId = req.user_id;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (!userId) {
      res.status(400).json({
        message: "no user found",
      });
      return;
    }

    try {
      const workspace = await pgClient.workspaces.findUnique({
        where: { id: workspaceId },
        include: { owner: true },
      });
      if (workspace?.owner_id !== userId) {
        res.status(403).json({ message: "Only the owner can invite users." });
        return;
      }

      const token = uuidv4();
      await pgClient.workspace_invitation_links.create({
        data: {
          workspace_id: workspaceId,
          token: token,
          created_by: userId,
          expiresAt: expiresAt,
        },
      });
      // make it env
      const inviteUrl = `${FRONTEND_URL}/invite/${token}`;
      res.status(200).json({
        message: "Invitation link generated successfully",
        data: inviteUrl,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create invitation link." });
    }
  }
);
workspaceRouter.get(
  "/:workspaceId/members",
  auth,
  async (req: CustomRequest, res) => {
    const workspaceId = parseInt(req.params.workspaceId);
    try {
      const members = await pgClient.workspace_members.findMany({
        where: { workspace_id: workspaceId },
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
      });
      const memberdata = members.map((member) => member.user);
      res.json({
        message: "members fetched",
        data: memberdata,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workspace members" });
    }
  }
);
workspaceRouter.delete('/:workspaceId',auth, async (req: CustomRequest, res) => {
  const workspaceId = parseInt(req.params.workspaceId);
  try {
    const workspace = await pgClient.workspaces.findUnique({
      where:{
        id:workspaceId
      }
    })
    if(!workspace){
      res.status(201).json({ error: "workspace not found" });
      return
    }
    await pgClient.workspaces.delete({
      where: { id: workspaceId },
    });
    res.status(200).json({ message: "workspace deleted " });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
})
workspaceRouter.put('/:workspaceId',auth, async (req: CustomRequest, res) => {
  const name = req.body.workspacename;
  const workspaceId = parseInt(req.params.workspaceId);
  try {
    const workspace = await pgClient.workspaces.findUnique({
      where:{
        id:workspaceId
      }
    })
    if(!workspace){
      res.status(201).json({ error: "workspace not found" });
      return
    }
    await pgClient.workspaces.update({
      where: { id: workspaceId },
      data:{
        name:name
      }
    });
    res.status(200).json({ message: "workspace updated " });
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ error: "Failed to update workspace" });
  }

})

workspaceRouter.use("/", dmRouter);
workspaceRouter.use("/", channelRouter);
