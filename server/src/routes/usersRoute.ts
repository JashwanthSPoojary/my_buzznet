import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient,Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import passport from "passport";
import { userSchema } from "../middleware/validationSchema";

const userRouter = Router();
const pgClient = new PrismaClient();

userRouter.post("/signup", async (req, res) => {
  const validateSchema = userSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  }
  const { username, password } = req.body;

  const password_hash = await bcrypt.hash(password, 5);
  try {
    await pgClient.users.create({
      data: {
        username: username,
        password_hash: password_hash,
      },
    });
    res.status(201).json({
      message: "user signed up",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      Array.isArray(error.meta?.target) && 
      error.meta?.target?.includes("username")
    ) {
      res.status(409).json({
        error: "User already exists",
      });
    } else {
      res.status(500).json({
        error:"Failed to sign up"
      });
    }
  }
});
userRouter.post("/signin", async (req, res) => {
  const validateSchema = userSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  }
  const { username, password } = req.body;

  try {
    const response = await pgClient.users.findUnique({
      where: {
        username: username,
      },
    });
    if (response === null) {
      res.status(400).json({
        error: "username is wrong",
      });
      return;
    }
    const password_hash = response?.password_hash;
    const user_id = response?.id;
    if (password_hash === undefined) return;
    const validPassword = await bcrypt.compare(password, password_hash);
    if (!validPassword) {
      res.status(400).json({
        error: "password is wrong",
      });
      return;
    }
    if (JWT_SECRET === undefined) return;
    const token = await jwt.sign(
      {
        user_id: user_id,
      },
      JWT_SECRET
    );

    res.status(201).json({
      message: "user signed in",
      token: token,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
});
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
userRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req: Request, res: Response) => {
    res.json({ token: req.user?.token });
  }
);

export { userRouter };
