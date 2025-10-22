import express from "express";
import {
  isAdmin,
  isAuth,
} from "../../middlewares/index.js";
import {
  deletePlant,
  editPlant,
  flexiblePlantSearch,
  getAllPlants,
  getPlantById,
  getPlantsByCommonName,
  getPlantsByScientificName,
  getPlantsByType,
  postNewPlant,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const plantRouter = express.Router();

// GET
plantRouter.get("/search", isAuth, flexiblePlantSearch);
plantRouter.get("/all-plants", isAuth, getAllPlants);
plantRouter.get("/plant/:id", isAuth, getPlantById);
plantRouter.get("/search/scientific-name", isAuth, getPlantsByScientificName);
plantRouter.get("/search/type", isAuth, getPlantsByType);
plantRouter.get("/search/common-name", isAuth, getPlantsByCommonName);
// POST
plantRouter.post("/new-plant", isAuth, upload.single("imgPath"), postNewPlant);
// PUT
plantRouter.put("/plant/:id", isAuth, isAdmin, upload.single("imgPath"), editPlant);
// DELETE
plantRouter.delete("/plant/:id", isAuth, isAdmin, deletePlant);
