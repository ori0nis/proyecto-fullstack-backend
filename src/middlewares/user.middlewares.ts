import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUserType, UserResponseType, PublicUserType, UserType } from "../types/user/index.js";
import { User } from "../api/models/index.js";
import { AuthRequest } from "../types/jwt/AuthRequest.type.js";

//? Checks what the mongoose model can't (unique username and email)
export const isUniqueUser = async (
  req: Request<{}, {}, NewUserType>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    const usernameTaken = await User.findOne({ username: req.body.username });

    if (userExists) {
      res.status(409).json({
        message: "An account with this email already exists",
        status: 409,
        data: null,
      });

      return;
    }

    if (usernameTaken) {
      res.status(409).json({
        message: "Username is already taken",
        status: 409,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

//? Allows users to update their own profile (except for role), and admins to update anyone
export const canEditUser = async (req: AuthRequest<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const requester = req.user;
    const { id } = req.params;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (requester._id.toString() === id || requester.role === "admin") {
      if ("role" in req.body) delete req.body.role;

      next();
    } else {
      res.status(403).json({
        message: "You can't update other users",
        status: 403,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

//? Not even admin can change other users' passwords, that's saved for direct DB handling
export const canChangePassword = async (
  req: AuthRequest<{ id: string }, {}, { oldPassword: string; newPassword: string }>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { oldPassword } = req.body;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (user._id.toString() !== id) {
      res.status(403).json({
        message: "You can't update other users",
        status: 403,
        data: null,
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatches) {
      res.status(400).json({
        message: "Invalid credentials",
        status: 400,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

//? Users can only delete own account, admin can delete anyone
export const canDeleteUser = async (req: AuthRequest<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const requester = req.user;
    const { id } = req.params;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (requester._id.toString() !== id && requester.role !== "admin") {
      res.status(403).json({
        message: "You can't delete other users",
        status: 403,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

