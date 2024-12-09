import { JWT_SECRET } from "../utils/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  user_id?: number;
}

export const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.token as string;
  if (token) {
    try {
      if (!JWT_SECRET) return;
      const decodedinformation = (await jwt.verify(
        token,
        JWT_SECRET
      )) as JwtPayload;
      const user_id = decodedinformation.user_id;
      req.user_id = user_id;
      next();
    } catch (error) {
      res.json({
        error_message: "failed to authorize",
        error: error,
      });
    }
  } else {
    res.json({
      error_message: "user is unauthorized",
      error: "no token found ",
    });
    return;
  }
};
