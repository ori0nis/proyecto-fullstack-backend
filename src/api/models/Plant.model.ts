import mongoose from "mongoose";

interface Plant {
  scientific_name: string,
  nick_name: string,
  img: string,
  type: "tropical" | "desert" | "temperate" | "alpine"
}

const plantSchema = new mongoose.Schema<Plant>(
  {
    scientific_name: { type: String, required: true, trim: true },
    nick_name: { type: String, required: true, trim: true },
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
