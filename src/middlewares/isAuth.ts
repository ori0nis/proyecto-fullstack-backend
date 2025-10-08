import { Response, NextFunction, RequestHandler } from "express";
import { UserResponse, User } from "../types/user/index.js";
import { verifyToken } from "../utils/index.js";
import { UserModel } from "../api/models/index.js";
import { AuthRequest, JWTPayload } from "../types/jwt/index.js";

export const isAuth: RequestHandler = async (
  req: AuthRequest,
  res: Response<UserResponse<User>>,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const decoded = verifyToken({ token }) as JWTPayload;
    const user = await UserModel.findById(decoded._id);

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
