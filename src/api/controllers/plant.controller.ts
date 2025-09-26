import { Plant } from "./../models/Plant.model";
import { type Request, type Response, type NextFunction } from "express";

// GET ALL PLANTS
export const getAllPlants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plants = await Plant.find();

    res.status(200).json({
      message: "Plants found",
      plants: plants,
    });
  } catch (error) {
    next(error);
  }
};

// GET PLANT BY ID
export const getPlantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
      });

      return;
    }

    res.status(200).json({
      message: "Plant found",
      plant: plant,
    });
  } catch (error) {
    next(error);
  }
};

// POST NEW PLANT
export const postNewPlant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plant = new Plant(req.body);

    const plantPosted = await plant.save();

    res.status(201).json({
      message: "Plant posted",
      plant: plantPosted,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT PLANT
export const editPlant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);
    const updatedPlant = req.body;

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
      });
    }

    const plantPosted = await Plant.findByIdAndUpdate(id, updatedPlant, { new: true });

    res.status(200).json({
      message: "Plant updated",
      plant: plantPosted,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PLANT
export const deletePlant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = Plant.findById(id);

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
      });
    }

    const plantDeleted = await Plant.findByIdAndDelete(id);

    res.status(200).json({
      message: "Plant deleted",
      plant: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};
