import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { APP_PASSWORD, EMAIL_USER, FRONTEND_URL, JWT_SECRET } from "../utils/config";
import passport, { use } from "passport";
import { signinSchema,signupEmailSchema,signupSchema, verifyOtp } from "../middleware/validationSchema";
import { auth,CustomRequest } from "../middleware/auth";
import { escape } from "querystring";
import nodemailer from 'nodemailer';


const userRouter = Router();
const pgClient = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: APP_PASSWORD  // Gmail App Password
  }
});

async function sendOTP(email:string, otp:string) {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4CAF50; font-size: 32px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `
  };
  transporter.sendMail(mailOptions);
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

userRouter.post('/verify-otp', async (req, res) => {
  const validateSchema = verifyOtp.safeParse(req.body);
  if (!validateSchema.success) {
    res.status(202).json({
      error: validateSchema.error.errors[0].message,
    });
    return
  };
  const { email, otp } = req.body;
  try {
    const verification = await pgClient.emailVerification.findFirst({
      where:{
        email:email,
        otp:otp,
        expires_at:{
          gt:new Date(),
        }
      }
    })
    if (!verification) {
      res.status(202).json({
        error: "Invalid or expired OTP"
      });
      return 
    }

    await pgClient.users.create({
      data:{
        email:email,
        email_verified:true
      }
    });
    await pgClient.emailVerification.delete({
      where: { email }
    });
    res.status(200).json({
      message: "Email verified successfully"
    });
  } catch (error) {
    console.log(error);
  }
})

userRouter.post("/signupemail", async (req, res) => {
  const validateSchema = signupEmailSchema.safeParse(req.body);
  console.log(validateSchema);
  
  if (!validateSchema.success) {
    res.status(202).json({
      error: validateSchema.error.errors[0].message,
    });
    return;
  };
  const { email } = req.body;
  try {
    const otp = generateOTP();
    const expireTime = new Date(Date.now()+10*60*1000);


    const response =await  pgClient.users.findFirst({
      where:{
        email:email
      }
    })
    console.log(response);
    
    if(response) {
      console.log(response);
      res.status(202).json({
        error:"user already exists"
      });
      return
    }
    await pgClient.emailVerification.upsert({
      where:{email},
      update:{
        email:email,
        otp:otp,
        expires_at:expireTime
      },
      create:{
        email:email,
        otp:otp,
        expires_at:expireTime
      }
    });

    await sendOTP(email,otp);
    res.status(200).json({
      message: "OTP sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to send OTP"
    });
    console.log(error);
    
  }

});
userRouter.post("/signupusername", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  console.log(password);
  
  const password_hash = await bcrypt.hash(password, 5);
  try {
    const workspace = await pgClient.users.update({
      where:{
        email:email
      },
      data:{
        username:username,
        password_hash:password_hash
      }
    });
    if(!workspace){
      res.status(202).json({
        error:"Failed to signup"
      })
    }
    res.status(200).json({
      message:"signed up"
    })
  } catch (error) {
    console.log(error);
  }
});
userRouter.post("/checkemail", async (req, res) => {
  const email = req.body.email;
  try {
    const workspace = await pgClient.users.findFirst({
      where:{
        email:email
      },
      select:{
        id:true,
        username:true,
      }
    });
    if(workspace?.username){
      res.status(202).json({
        error:"no email id"
      })
      return
    }
    if(!workspace){
      res.status(202).json({
        error:"no email id"
      })
      return
    }
    res.status(200).json({
      message:"valid email"
    })
  } catch (error) {
    console.log(error);
  }
});

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
    if (password_hash === null) return;
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
      res.redirect(`${FRONTEND_URL}/error`)
    }else{
      res.redirect(`${FRONTEND_URL}/google/callback?token=${token}`)
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
