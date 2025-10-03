//? Plants that users have in their profiles. Taken from the Plant model

import mongoose, { Types } from "mongoose";
import { UserPlantType } from "../../types/plant/index.js";

const userPlantSchema = new mongoose.Schema<UserPlantType>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: "plants" },
    nameByUser: { type: String, required: true, trim: true },
    imgPath: { type: String, required: true, trim: true },
    imgPublicUrl: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    strict: true,
  }
);

export const UserPlant = mongoose.model("userplants", userPlantSchema, "userplants");
