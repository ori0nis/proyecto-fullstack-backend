import express from "express";
import {
  canDeleteUserPlant,
  canEditOrDeleteRepoPlant,
  canEditUserPlant,
  isAdmin,
  isAuth,
} from "../../middlewares/index.js";
import {
  addPlantToProfile,
  deletePlant,
  deleteUserPlant,
  editPlant,
  editUserPlant,
  getAllPlants,
  getPlantById,
  getPlantsByCommonName,
  getPlantsByScientificName,
  getPlantsByType,
  postNewPlant,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const plantRouter = express.Router();

plantRouter.get("/all-plants", isAuth, getAllPlants);
plantRouter.get("/plant/:id", isAuth, getPlantById);
plantRouter.get("/search/scientific-name", isAuth, getPlantsByScientificName);
plantRouter.get("/search/common-name", isAuth, getPlantsByCommonName);
plantRouter.get("/search/type", isAuth, getPlantsByType);
plantRouter.post("/new-plant", isAuth, upload.single("imgPath"), postNewPlant);
plantRouter.put("/plant/:id", isAuth, isAdmin, canEditOrDeleteRepoPlant, upload.single("imgPath"), editPlant);
plantRouter.delete("/plant/:id", isAuth, isAdmin, canEditOrDeleteRepoPlant, deletePlant);
