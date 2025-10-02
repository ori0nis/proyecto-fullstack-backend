import { Response, NextFunction, RequestHandler } from "express";
import { UserResponseType, UserType } from "../types/user/index.js";
import { verifyToken } from "../utils/jwt/index.js";
import { User } from "../api/models/index.js";
import { AuthRequest, JWTPayload } from "../types/jwt/index.js";

export const isAuth: RequestHandler = async (
  req: AuthRequest,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    // Extract token, decode it, find the user that's making the request in mongo. If there's no user, 401
    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken({ token }) as JWTPayload;
    const user = await User.findById(decoded._id);

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
