//? req.user is always double checked even after passing isAuth(), as a good practice. Mongoose documents are returned with .lean() so that they're in plain object format and can be assigned as PlantType

import { type Response, type NextFunction } from "express";
import { supabase } from "../../config/index.js";
import { supabaseUpload } from "../../middlewares/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { NewPlant, PlantResponse, Plant } from "../../types/plant/index.js";
import { isAllowedImage, isValidScientificName } from "../../utils/index.js";
import { PlantModel } from "./../models/index.js";

// GET ALL PLANTS
export const getAllPlants = async (
  req: AuthRequest,
  res: Response<PlantResponse<Plant[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const plants = await PlantModel.find().lean<Plant[]>();

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
  req: AuthRequest<{}, {}, {}, { id: string }>,
  res: Response<PlantResponse<Plant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({
        message: "Please provide a valid plant id",
        status: 400,
        data: null,
      });

      return;
    }

    const plant = await PlantModel.findById(id).lean<Plant>();

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

// GET PLANT BY SCIENTIFIC NAME
export const getPlantsByScientificName = async (
  req: AuthRequest<{}, {}, {}, { scientific_name: string }>,
  res: Response<PlantResponse<Plant[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { scientific_name } = req.query;

    if (!scientific_name || scientific_name.trim() === "") {
      res.status(400).json({
        message: "Please provide a valid scientific name",
        status: 400,
        data: null,
      });

      return;
    }

    const plants = await PlantModel.find({
      scientific_name: { $regex: new RegExp(scientific_name.trim(), "i") },
    }).lean<Plant[]>();

    if (!plants.length) {
      res.status(404).json({
        message: "No plants found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Plants found",
      status: 200,
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// GET PLANT BY TYPE
export const getPlantsByType = async (
  req: AuthRequest<{}, {}, {}, { type: string }>,
  res: Response<PlantResponse<Plant[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { type } = req.query;
    const allowedTypes = ["tropical", "desert", "temperate", "alpine", "aquatic"];

    if (!type || type.trim() === "" || !allowedTypes.includes(type.toLowerCase())) {
      res.status(400).json({
        message: "Please provide a valid plant type: tropical, desert, temperate, alpine, aquatic",
        status: 400,
        data: null,
      });

      return;
    }

    const plants = await PlantModel.find({ type: type.toLowerCase() }).lean<Plant[]>();

    if (!plants.length) {
      res.status(404).json({
        message: "No plants found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Plants found",
      status: 200,
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// GET PLANT BY COMMON NAME
export const getPlantsByCommonName = async (
  req: AuthRequest<{}, {}, {}, { common_name: string }>,
  res: Response<PlantResponse<Plant[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { common_name } = req.query;

    if (!common_name || common_name.trim() === "") {
      res.status(400).json({
        message: "Please provide a valid common name",
        status: 400,
        data: null,
      });

      return;
    }

    const plants = await PlantModel.find({
      common_name: { $regex: new RegExp(common_name.trim(), "i") },
    }).lean<Plant[]>();

    if (!plants.length) {
      res.status(404).json({
        message: "No plants found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Plants found",
      status: 200,
      data: plants,
    });
  } catch (error) {
    next(error);
  }
};

// POST NEW PLANT (UNIVERSAL REPOSITORY)
export const postNewPlant = async (
  req: AuthRequest<{}, {}, NewPlant>,
  res: Response<PlantResponse<Plant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const scientific_name = req.body.scientific_name.trim();
    const plantExists = await PlantModel.findOne({ scientific_name });

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

    try {
      await isAllowedImage(plantImg);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid image",
        status: 400,
        data: null,
      });

      return;
    }

    const { imgPath, publicUrl } = await supabaseUpload(plantImg);

    const plant = new PlantModel({
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

// EDIT PLANT (UNIVERSAL REPOSITORY)
export const editPlant = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewPlant>>,
  res: Response<PlantResponse<Plant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const plant = await PlantModel.findById(id);

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const plantImg = req.file;
    let imgPath = plant.imgPath;
    let imgPublicUrl = plant.imgPublicUrl;

    if (plantImg) {
      try {
        await isAllowedImage(plantImg);

        const { error: deleteError } = await supabase.storage.from("images").remove([plant.imgPath]);

        if (deleteError) {
          res.status(500).json({
            message: "Error deleting old image from Supabase",
            status: 500,
            data: null,
          });

          return;
        }

        const uploaded = await supabaseUpload(plantImg);
        imgPath = uploaded.imgPath;
        imgPublicUrl = uploaded.publicUrl;
      } catch (error) {
        res.status(400).json({
          message: error instanceof Error ? error.message : "Invalid image",
          status: 400,
          data: null,
        });

        return;
      }
    }

    const plantUpdated = await PlantModel.findByIdAndUpdate(
      id,
      { ...updates, imgPath, imgPublicUrl },
      { new: true }
    ).lean<Plant>();

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
  res: Response<PlantResponse<Plant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const plant = await PlantModel.findById(id);

    if (!plant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const { error: deleteError } = await supabase.storage.from("images").remove([plant.imgPath]);

    if (deleteError) {
      res.status(500).json({
        message: "Error deleting image from Supabase",
        status: 500,
        data: null,
      });

      return;
    }

    const plantDeleted = await PlantModel.findByIdAndDelete(id).lean<Plant>();

    if (!plantDeleted) {
      res.status(500).json({
        message: "Error deleting plant",
        status: 500,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Plant deleted",
      status: 200,
      data: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};
