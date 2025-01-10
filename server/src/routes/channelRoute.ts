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
channelRouter.get('/:workspace_id/channel/channelIds',auth, async (req: CustomRequest, res) => {
  const workspace_id = parseInt(req.params.workspace_id);
  try {
    const response = await pgClient.channels.findFirst({
      where:{
        workspace_id:workspace_id
      },
      select:{
        id:true
      }
    })
    res.status(200).json({
      message:"first channel id is fetched",
      data:response
    })
  } catch (error) {
    console.log("error in first channel id is fetched");
    console.log(error);
  }
})
channelRouter.delete('/:workspaceId/channel/:channelId',auth, async (req: CustomRequest, res) => {
  const channelId = parseInt(req.params.channelId);
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
    const existingChannel = await pgClient.channels.findUnique({
      where: { id: channelId },
    });
    if (!existingChannel) {
      res.status(201).json({ error: "Channel not found" });
      return 
    }
    await pgClient.channels.delete({
      where: { id: channelId },
    });
    res.status(200).json({ message: "Channel deleted" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ error: "Failed to delete channel" });
  }
})
channelRouter.put('/:workspaceId/channel/:channelId',auth, async (req: CustomRequest, res) => {
  const channelId = parseInt(req.params.channelId);
  const workspaceId = parseInt(req.params.workspaceId);
  const name = req.body.channelname;
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
    const existingChannel = await pgClient.channels.findUnique({
      where: { id: channelId },
    });
    if (!existingChannel) {
      res.status(201).json({ error: "Channel not found" });
      return 
    }
    await pgClient.channels.update({
      where: { id: channelId },
      data:{
        name:name
      }
    });
    res.status(200).json({ message: "Channel updated" });
  } catch (error) {
    console.error("Error updating channel:", error);
    res.status(500).json({ error: "Failed to update channel" });
  }
})
channelRouter.post('/:workspace_id/voicechannel/create',auth, async (req: CustomRequest, res) => {
  const workspace_id = parseInt(req.params.workspace_id);
  const name = req.body.name;
  const userId = req.user_id;
  if (!name || !workspace_id || !userId) {
    res.status(400).json({ error: "Name and workspaceId and userId are required." });
    return
  }
  try {
    const newChannel = await pgClient.voiceChannel.create({
      data: {
        name:name,
        workspaceId:workspace_id,
        creatorId: userId,
      },
    });
    res.status(201).json({
      message: "channel created",
      data:newChannel
    });
  } catch (error) {
    res.status(400).json({
      error: "failed to create workspace",
    });
  }

})
channelRouter.get(
  "/:workspace_id/voicechannel/getvoicechannels",
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
      const response = await pgClient.voiceChannel.findMany({
        where: {
          workspaceId: workspace_id,
        },
      });
      res.status(201).json({
        message: "voice channels fetched",
        data: response,
      });
    } catch (error) {
      res.status(400).json({
        error: "failed to fetch channels",
      });
    }
  }
);
channelRouter.post("/:workspace_id/voicechannel/join",auth, async (req: CustomRequest, res) => {
  const channelId  = parseInt(req.body.channelId);
  const workspace_id = parseInt(req.params.workspace_id);
  const userId  = req.user_id;
  if (!userId || !channelId || !workspace_id ) {
    res.status(400).json({
      error: "no user is found",
    });
    return;
  }
  try {
    const response = await pgClient.voiceChannel.update({
      where:{
        id:channelId,
        workspaceId:workspace_id
      },
      data:{
        members:{
          connect: {id:userId}
        }
      },
      include:{
        members:true
      }
    })
    res.status(200).json({ 
      message: "Joined the channel successfully.",
      data:response
     });
  } catch (error) {
    res.status(500).json({ error: "Error joining the voice channel." });
  }
})
channelRouter.get("/:workspace_id/voicechannel/participants/:voiceChannelId",auth, async (req: CustomRequest, res) => {
  const voiceChannelId = parseInt(req.params.voiceChannelId);
  const userId  = req.user_id;
  if (!userId ) {
    res.status(400).json({
      error: "no user is found",
    });
    return;
  }
  try {
    const response = await pgClient.users.findMany({
      where: {
        voicechannels: {
          some: { id: voiceChannelId }, 
        },
      },
      select: {
        id: true, 
      },
    });
    res.status(201).json({
      message:"all participants fetched",
      data:response
    })
  } catch (error) {
    res.status(500).json({
      error:"server error",
    })
  }
})
  
channelRouter.use("/:workspace_id/channel/", messageRouter);
