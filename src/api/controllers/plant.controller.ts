//? req.user is always double checked even after passing isAuth(), as a good practice. Mongoose documents are returned with .lean() so that they're in plain object format and can be assigned as PlantType

import { AuthImplicitGrantRedirectError } from "@supabase/supabase-js";
import { supabaseUpload } from "../../middlewares/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { NewPlantType, PlantResponse, PlantType, UserPlantType } from "../../types/plant/index.js";
import { isValidScientificName } from "../../utils/index.js";
import { Plant, User, UserPlant } from "./../models/index.js";
import { type Response, type NextFunction } from "express";

// GET ALL PLANTS
export const getAllPlants = async (
  req: AuthRequest,
  res: Response<PlantResponse<PlantType[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const plants = await Plant.find().lean<PlantType[]>();

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

    const plant = await Plant.findById(id).lean<PlantType>();

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    } else {
      res.status(200).json({
        message: "Plant found",
        status: 200,
        data: plant,
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST NEW PLANT (UNIVERSAL REPOSITORY)
export const postNewPlant = async (
  req: AuthRequest<{}, {}, NewPlantType>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const scientific_name = req.body.scientific_name.trim();
    const plantExists = await Plant.findOne({ scientific_name });

    if (plantExists) {
      res.status(409).json({
        message: "Plant already exists in the database",
        status: 409,
        data: null,
      });

      return;
    }

    const isValid = await isValidScientificName(scientific_name);

    if (!isValid) {
      res.status(422).json({
        message: "Invalid scientific name",
        status: 422,
        data: null,
      });

      return;
    }

    const plantImg = req.file;

    if (!plantImg) {
      res.status(400).json({
        message: "No image uploaded",
        status: 400,
        data: null,
      });

      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    
    if (!allowedTypes.includes(plantImg.mimetype)) {
      res.status(400).json({
        message: "Invalid file type. Please upload a JPEG or PNG.",
        status: 400,
        data: null,
      });

      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (plantImg.size > MAX_SIZE) {
      res.status(400).json({
        message: "File too large. Max size is 5MB.",
        status: 400,
        data: null,
      });

      return;
    }

    const { imgPath, publicUrl } = await supabaseUpload(plantImg);

    const plant = new Plant({
      ...req.body,
      scientific_name,
      imgPath,
      imgPublicUrl: publicUrl,
    });

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

// ADD NEW PLANT TO USER PROFILE
export const addPlantToProfile = async (
  req: AuthRequest<{}, {}, { plantId: string; nameByUser: string }>,
  res: Response<PlantResponse<UserPlantType>>,
  next: NextFunction
) => {
  try {
    const { plantId, nameByUser } = req.body;
    const userId = req.user?._id;

    const plantInRepository = await Plant.findById(plantId);

    if (!plantInRepository) {
      res.status(404).json({
        message: "Plant not found in repository",
        status: 404,
        data: null,
      });

      return;
    }

    const userPlant = new UserPlant({ userId, plantId, nameByUser });
    const savedUserPlant = await userPlant.save();

    await User.findByIdAndUpdate(userId, { $push: { plants: savedUserPlant._id } });

    res.status(201).json({
      message: "Plant added to user profile",
      status: 201,
      data: savedUserPlant,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT PLANT (UNIVERSAL REPOSITORY)
// TODO: Img edition
//? Request type is only partial and of NewPlantType to avoid security concerns regarding _id
export const editPlant = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewPlantType>>,
  res: Response<PlantResponse<PlantType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plant = await Plant.findById(id);

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const plantUpdated = await Plant.findByIdAndUpdate(id, updates, { new: true }).lean<PlantType>();

    res.status(200).json({
      message: "Plant updated",
      status: 200,
      data: plantUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE PLANT (UNIVERSAL REPOSITORY)
export const deletePlant = async (
  req: AuthRequest<{ id: string }>,
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

    const plantDeleted = await Plant.findByIdAndDelete(id).lean<PlantType>();

    res.status(200).json({
      message: "Plant deleted",
      status: 200,
      data: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};
