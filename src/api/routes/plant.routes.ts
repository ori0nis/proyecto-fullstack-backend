import express from "express";
import { isAdmin, isAuth } from "../../middlewares/index.js";
import { deletePlant, editPlant, getAllPlants, getPlantById, postNewPlant } from "../controllers/index.js";

const plantRouter = express.Router();

plantRouter.get("/all-plants", isAuth, getAllPlants);
plantRouter.get("/plant/:id", isAuth, getPlantById);
plantRouter.post("/new-plant", isAuth, postNewPlant);
plantRouter.put("/plant/:id", isAuth, isAdmin, editPlant);
plantRouter.delete("/plant/:id", isAuth, isAdmin, deletePlant);