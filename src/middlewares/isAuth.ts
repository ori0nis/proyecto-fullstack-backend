import { Response, NextFunction, RequestHandler } from "express";
import { UserResponse, User, SingleUserResponse, PublicUser } from "../types/user/index.js";
import { generateToken, verifyToken } from "../utils/index.js";
import { UserModel } from "../api/models/index.js";
import { AuthRequest, JWTPayload } from "../types/jwt/index.js";
import { isProduction } from "../index.js";

// AUTHENTICATION
export const isAuth: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
    const user = await UserModel.findById(decoded._id).lean<PublicUser>();

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

// TOKEN REFRESH
export const refreshToken = async (
  req: AuthRequest,
  res: Response<UserResponse<SingleUserResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        message: "Refresh token not found",
        status: 401,
        data: null,
      });

      return;
    }

    const decoded = verifyToken({ token: refreshToken, refresh: true }) as JWTPayload;

    if (!decoded) {
      res.status(403).json({
        message: "Invalid or expired refresh token",
        status: 403,
        data: null,
      });

      return;
    }

    const user = await UserModel.findById(decoded._id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const newAccessToken = generateToken({
      _id: user._id.toString(),
      role: user.role,
    });

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...publicUser } = user;

    res.status(200).json({
      message: "Token refreshed successfully",
      status: 200,
      data: {
        user: publicUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
