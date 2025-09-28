import { Request, Response, NextFunction } from "express";
import { UserResponseType, UserType } from "../../types/user";
import { verifyToken } from "../jwt";
import { User } from "../../api/models";
import { AuthRequest, JWTPayload } from "../../types/jwt";

export const isAuth = async (
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

    const token = authHeader.replace("Bearer ", "").trim();

    const decoded = verifyToken({ token }) as JWTPayload;
    req.user = await User.findById(decoded._id);
    
    next();
  } catch (error) {
    next(error);
  }
};
