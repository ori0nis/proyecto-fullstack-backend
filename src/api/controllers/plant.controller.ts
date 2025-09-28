//? req.user is always double checked even after passing isAuth(), as a good practice

import { AuthRequest } from "../../types/jwt";
import { NewPlantType, PlantResponse, PlantType } from "../../types/plant";
import { Plant } from "./../models";
import { type Response, type NextFunction } from "express";

// GET ALL PLANTS
export const getAllPlants = async (
  req: AuthRequest,
  res: Response<PlantResponse<PlantType[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const plants = await Plant.find();

    res.status(200).json({
      message: "Plants found",
      status: 200,
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// GET PLANT BY ID
export const getPlantById = async (
  req: AuthRequest<{ id: string }>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);

    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Plant found",
      status: 200,
      data: plant,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER'S PLANTS
export const getUsersPlants = async (
  req: AuthRequest,
  res: Response<PlantResponse<PlantType[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const plants = await Plant.find({ _id: { $in: user.plants } });

    res.status(200).json({
      message: "Plants found",
      status: 200,
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// POST NEW PLANT
export const postNewPlant = async (
  req: AuthRequest<{}, {}, NewPlantType>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const plant = new Plant(req.body);

    const plantPosted = await plant.save();

    res.status(201).json({
      message: "Plant posted",
      status: 201,
      data: plantPosted,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT PLANT
//? Request type is only partial and of NewPlantType to avoid security concerns regarding _id
export const editPlant = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewPlantType>>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);
    const updatedPlant = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const plantUpdated = await Plant.findByIdAndUpdate(id, updatedPlant, { new: true });

    res.status(200).json({
      message: "Plant updated",
      status: 200,
      data: plantUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PLANT
export const deletePlant = async (
  req: AuthRequest<{ id: string }>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);

    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const plantDeleted = await Plant.findByIdAndDelete(id);

    res.status(200).json({
      message: "Plant deleted",
      status: 200,
      data: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};
