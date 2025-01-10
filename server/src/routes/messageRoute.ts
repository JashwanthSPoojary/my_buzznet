import { Router } from "express";
import { auth, CustomRequest } from "../middleware/auth";
import { messageSchema } from "../middleware/validationSchema";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const pgClient = new PrismaClient();
export const messageRouter = Router();

messageRouter.post(
  "/:channel_id/message/create",
  auth,
  async (req: CustomRequest, res) => {
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
    if (!user_id) {
      res.status(400).json({
        error: "no user found",
      });
      return;
    }
    try {
      const response = await pgClient.channel_message.create({
        data: {
          content: content,
          channel_id: channel_id,
          sender_id: user_id,
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
messageRouter.get(
  "/:channel_id/getmessages",
  auth,
  async (req: CustomRequest, res) => {
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
        include: {
          sender: true,
        },
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
messageRouter.delete(
  "/:channelId/message/:messageId",
  auth,
  async (req: CustomRequest, res) => {
    const messageId = parseInt(req.params.messageId);
    const channelId = parseInt(req.params.channelId);
    try {
      if (!channelId) {
        res.status(201).json({ error: "channel not found" });
        return;
      }
      const deletedMessage = await pgClient.channel_message.delete({
        where: { id: messageId },
      });
      if (!deletedMessage) {
        res.status(201).json({ error: "Message not found" });
        return;
      }
      res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  }
);
messageRouter.post(
  "/:channel_id/message/upload",
  upload.single("file"),
  auth,
  async (req: CustomRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded or invalid file type" });
      return;
    }
    res.json({
      message: "Image uploaded successfully",
      filePath: `/uploads/${req.file.filename}`,
    });
  }
);
