import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/jwt/index.js";
import { NewUserPlant, PlantResponse, PlantType, UserPlantType } from "../types/plant/index.js";
import { User, UserPlant } from "../api/models/index.js";

//? Only admin can edit or delete a plant from universal repository
export const canEditOrDeleteRepoPlant = async (
  req: AuthRequest,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
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

    if (requester.role !== "admin") {
      res.status(403).json({
        message: "You can't modify MyPlants Nursery plants",
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

//? Only owner can add plants to profile
export const canAddUserPlant = async (
  req: AuthRequest<{ userId: string }, {}, { plantId: string; nameByUser: string }>,
  res: Response<PlantResponse<UserPlantType>>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const requester = req.user;

    if (!requester) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    if (requester._id.toString() !== user._id.toString()) {
      res.status(403).json({
        message: "You can't add plants to other user's profile",
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
  req: AuthRequest<{  userId: string; plantId: string }, {}, Partial<NewUserPlant>>,
  res: Response<PlantResponse<UserPlantType>>,
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

    const userPlant = await UserPlant.findById(plantId);

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
  req: AuthRequest<{ userId: string, plantId: string }>,
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

    const userPlant = await UserPlant.findById(plantId);

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

    next();
  } catch (error) {
    next(error);
  }
};
