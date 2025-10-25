import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUser, UserResponse, PublicUser } from "../types/user/index.js";
import { UserModel, UserPlantModel } from "../api/models/index.js";
import { AuthRequest } from "../types/jwt/index.js";
import { NewUserPlant, PlantResponse, UserPlant } from "../types/plant/index.js";

type ActionType = "edit" | "delete";

//? User can only edit or delete own profile, admin can edit or delete anyone, but can't appoint other admins
export const canEditOrDeleteUser = (action: ActionType) => {
  return async (req: AuthRequest<{ id: string }>, res: Response, next: NextFunction) => {
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

      const isSelf = requester._id.toString() === id;
      const isAdmin = requester.role === "admin";

      if (!isSelf && !isAdmin) {
        res.status(403).json({
          message: `You can't ${action} other users`,
          status: 403,
          data: null,
        });

        return;
      }

      if (action === "edit" && req.body && "role" in req.body) delete req.body.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

//? Check user password (for confirming profile edits)
export const checkUserPassword = async (
  req: AuthRequest,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      res.status(400).json({
        message: "Password is required to complete this action",
        status: 400,
        data: null,
      });

      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
      res.status(401).json({
        message: "Password is incorrect",
        status: 401,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

//? Checks that username and email are unique upon register
export const isUniqueUserOnRegister = async (
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

//? Checks that username and email are unique upon user profile edit
export const isUniqueUserOnProfileEdit = async (
  req: Request<{ id: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, username } = req.body;

    if (email) {
      const emailExists = await UserModel.findOne({ email });

      if (emailExists) {
        if (emailExists._id.toString() === id) {
          res.status(400).json({
            message: "You're already using that email",
            status: 400,
            data: null,
          });

          return;
        }

        res.status(409).json({
          message: "An account with that email already exists",
          status: 409,
          data: null,
        });

        return;
      }
    }

    if (username) {
      const usernameExists = await UserModel.findOne({ username });

      if (usernameExists) {
        if (usernameExists._id.toString() === id) {
          res.status(400).json({
            message: "You're already using this username",
            status: 400,
            data: null,
          });

          return;
        }

        res.status(409).json({
          message: "Username is already taken",
          status: 409,
          data: null,
        });

        return;
      }
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

//? Not even admin can change other users' passwords, that's saved for direct DB handling
export const canChangePassword = async (
  req: AuthRequest<{ id: string }, {}, { oldPassword: string; newPassword: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
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

    next();
  } catch (error) {
    next(error);
  }
};

//? Works for confirming UserPlant ownership and allow edition or deletion
export const loadUserPlant = async (
  req: AuthRequest<{ plantId: string }, {}, Partial<NewUserPlant>>,
  res: Response<PlantResponse<UserPlant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userPlant = await UserPlantModel.findById(plantId).lean<UserPlant>();

    if (!userPlant) {
      res.status(404).json({
        message: "Plant not found or does not belong to user",
        status: 404,
        data: null,
      });

      return;
    }

    if (userPlant.userId.toString() !== userId.toString() && req.user?.role !== "admin") {
      res.status(403).json({
        message: "Forbidden. You can't manage other user's plants",
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
