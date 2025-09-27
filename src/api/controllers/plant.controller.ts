import { NewPlantType, PlantResponse, PlantType } from "../../types/plant";
import { Plant } from "./../models";
import { type Request, type Response, type NextFunction } from "express";

// GET ALL PLANTS
export const getAllPlants = async (
  req: Request,
  res: Response<PlantResponse<PlantType[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const plants = await Plant.find();

    res.status(200).json({
      message: "Plants found",
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// GET PLANT BY ID
export const getPlantById = async (
  req: Request<{ id: string }>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);

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
      data: plant,
    });
  } catch (error) {
    next(error);
  }
};

// POST NEW PLANT
export const postNewPlant = async (
  req: Request<{}, {}, NewPlantType>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const plant = new Plant(req.body);

    const plantPosted = await plant.save();

    res.status(201).json({
      message: "Plant posted",
      data: plantPosted,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT PLANT
//? Request type is only partial and of NewPlantType to avoid security concerns regarding _id
export const editPlant = async (
  req: Request<{ id: string }, {}, Partial<NewPlantType>>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await Plant.findById(id);
    const updatedPlant = req.body;

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
      data: plantUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PLANT
export const deletePlant = async (
  req: Request<{ id: string }>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = Plant.findById(id);

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
      data: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};
