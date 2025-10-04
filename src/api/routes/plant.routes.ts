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
  postNewPlant,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const plantRouter = express.Router();

//TODO: IMG
plantRouter.get("/all-plants", isAuth, getAllPlants);
plantRouter.get("/plant/:id", isAuth, getPlantById);
plantRouter.post("/new-plant", isAuth, upload.single("imgPath"), postNewPlant);
plantRouter.post("/user/:userId/new-plant", isAuth, upload.single("imgPath"), addPlantToProfile);
plantRouter.put("/plant/:id", isAuth, isAdmin, canEditOrDeleteRepoPlant, upload.single("imgPath"), editPlant);
plantRouter.put("/user/:userId/plant/:plantId", isAuth, canEditUserPlant, upload.single("imgPath"), editUserPlant);
plantRouter.delete("/plant/:id", isAuth, isAdmin, canEditOrDeleteRepoPlant, deletePlant);
plantRouter.delete("/user/:userId/plant/:plantId", isAuth, canDeleteUserPlant, deleteUserPlant);
