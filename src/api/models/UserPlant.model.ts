//? Plants that users have in their profiles. Taken from the Plant model

import mongoose from "mongoose";
import { UserPlant } from "../../types/plant/index.js";
import { constants } from "@xavisoft/mongoose-cascade";
const { ON_DELETE } = constants;

const userPlantSchema = new mongoose.Schema<UserPlant>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true, onDelete: ON_DELETE.CASCADE },
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: "plants", required: true },
    nameByUser: { type: String, required: true, trim: true },
    scientific_name: {type: String, required: true, trim: true},
    imgPath: { type: String, required: true, trim: true },
    imgPublicUrl: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const UserPlantModel = mongoose.model("userplants", userPlantSchema, "userplants");
