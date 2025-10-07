import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/jwt/index.js";
import { PlantResponse, Plant } from "../types/plant/index.js";

//? Only admin can edit or delete a plant from universal repository
export const canEditOrDeleteRepoPlant = async (
  req: AuthRequest,
  res: Response<PlantResponse<Plant>>,
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


