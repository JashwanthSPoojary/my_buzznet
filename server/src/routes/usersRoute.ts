import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import passport from "passport";
import { signinSchema,signupSchema } from "../middleware/validationSchema";
import { auth,CustomRequest } from "../middleware/auth";

const userRouter = Router();
const pgClient = new PrismaClient();

userRouter.post("/signup", async (req, res) => {
  const validateSchema = signupSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  }
  const { username, email , password } = req.body;

  const password_hash = await bcrypt.hash(password, 5);

  try {
    await pgClient.users.create({
      data: {
        username: username,
        email:email,
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
        error: "Failed to sign up",
        err: error,
      });
    }
  }
});
userRouter.post("/signin", async (req, res) => {
  const validateSchema = signinSchema.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(400).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  }
  const { email, password } = req.body;

  try {
    const response = await pgClient.users.findUnique({
      where: {
        email: email,
      },
    });
    if (response === null) {
      res.status(400).json({
        error: "Incorrect email",
      });
      return;
    }
    const password_hash = response?.password_hash;
    const user_id = response?.id;
    if (password_hash === undefined) return;
    const validPassword = await bcrypt.compare(password, password_hash);
    if (!validPassword) {
      res.status(400).json({
        error: "Incorrect password",
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
  passport.authenticate("google", { session:false,failureRedirect: "/" }),
  async (req: Request, res: Response) => {
    const token = req.user?.token;
    if(!token){
      res.redirect(`http://localhost:5173/signin`)
    }else{
      res.redirect(`http://localhost:5173/google/callback?token=${token}`)
    }
    
  }
);
userRouter.get('/userdetails',auth, async (req:CustomRequest,res)=>{
  const userId = req.user_id;
  
  try {
    const response = await pgClient.users.findFirst({
      where:{
        id:userId
    }
    })
    res.status(201).json({
      message:"user datails fetched",
      data:response
    });
  } catch (error) {
    res.status(400).json({
      message:"error of userdetails",
    });
    console.log("userdetails : "+error);
  }
})
userRouter.get('/invite/:token',auth,async (req:CustomRequest,res)=>{
  const { token } = req.params;
  const userId = req.user_id;
  if(!userId){
    res.status(201).json({
      error:"no user found"
    })
    return
  }
  try {
    const invite = await pgClient.workspace_invitation_links.findUnique({
      where:{
        token:token
      }
    })
    if (!invite){
      res.status(201).json({ error: 'Invalid invite token.' });
      return 
    } 
    const workspace = await pgClient.workspaces.findUnique({ where: { id: invite.workspace_id }});
    const user = await pgClient.users.findUnique({ where: { id: userId } });
    if (!workspace || !user){
      res.status(201).json({ error: 'Invalid workspace or user.' });
      return 
    }
    const isMember = await pgClient.workspace_members.findFirst({
      where: { workspace_id: workspace.id, user_id: user.id },
    });
    if (isMember){
      res.status(201).json({ error: 'You are already a member of this workspace.' });
      return 
    } 
    res.json({ message:"invite is valid",data:workspace.name });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});
userRouter.post('/invite/:token/accept',auth,async (req:CustomRequest,res)=>{
  const { token } = req.params;
  const userId = req.user_id;
  if(!userId){
    res.status(400).json({ error: 'no user found' });
    return
  }
  try {
    const invite = await pgClient.workspace_invitation_links.findUnique({ where: { token:token } });
    if (!invite){
      res.status(201).json({ error: 'Invalid invite token.' });
      return 
    } 
    const isMember = await pgClient.workspace_members.findFirst({
      where: { workspace_id: invite.workspace_id, user_id: userId },
    });
    if (isMember){
      res.status(201).json({ error: 'You are already a member of this workspace.' });
      return 
    } 
    await pgClient.workspace_members.create({
      data: { workspace_id: invite.workspace_id, user_id: userId },
    });
    res.json({ message: 'Successfully joined the workspace.' });
  } catch (error) {
    console.log("error");
    res.status(500).json({ error: 'Server error.' });
  }
});

export { userRouter };
