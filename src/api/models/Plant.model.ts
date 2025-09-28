import mongoose from "mongoose";
import { PlantType } from "../../types/plant";

const plantSchema = new mongoose.Schema<PlantType>(
  {
    scientific_name: { type: String, required: true, trim: true },
    common_name: { type: String, required: true, trim: true },
    nickname: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["tropical", "desert", "temperate", "alpine"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Plant = mongoose.model("plants", plantSchema, "plants");
