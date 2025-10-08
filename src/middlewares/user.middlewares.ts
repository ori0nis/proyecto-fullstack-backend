import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUser, UserResponse, PublicUser } from "../types/user/index.js";
import { UserModel, UserPlantModel } from "../api/models/index.js";
import { AuthRequest } from "../types/jwt/index.js";
import { NewUserPlant, PlantResponse, UserPlant } from "../types/plant/index.js";

//? Checks what the mongoose model can't (unique username and email)
export const isUniqueUser = async (
  req: Request<{}, {}, NewUser>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userExists = await UserModel.findOne({ email: req.body.email });
    const usernameTaken = await UserModel.findOne({ username: req.body.username });

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

//? Authorization
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requester = req.user;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (requester.role === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Forbidden. Admins only",
        status: 403,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

//? Allows users to update their own profile (except for role), and admins to update anyone
export const canEditUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      if (req.body && "role" in req.body) delete req.body.role;

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
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
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

//? Users can only edit their plants, admin can edit anyone
export const canEditUserPlant = async (
  req: AuthRequest<{ plantId: string }, {}, Partial<NewUserPlant>>,
  res: Response<PlantResponse<UserPlant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId } = req.params;
    const requester = req.user;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userPlant = await UserPlantModel.findById(plantId);

    if (!userPlant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    if (requester._id.toString() !== userPlant.userId.toString() && requester.role !== "admin") {
      res.status(403).json({
        message: "You can't edit other user's plants",
        status: 403,
        data: null,
      });

      return;
    }

    req.userPlant = userPlant;

    next();
  } catch (error) {
    next(error);
  }
};

//? Users can only delete their own plants, admins can delete anyone
export const canDeleteUserPlant = async (
  req: AuthRequest<{ plantId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId } = req.params;
    const requester = req.user;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userPlant = await UserPlantModel.findById(plantId);

    if (!userPlant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    if (requester._id.toString() !== userPlant.userId.toString() && requester.role !== "admin") {
      res.status(403).json({
        message: "You can't delete other user's plants",
        status: 403,
        data: null,
      });

      return;
    }

    req.userPlant = userPlant;

    next();
  } catch (error) {
    next(error);
  }
};

//? Users can only delete own account, admin can delete anyone
export const canDeleteUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
