import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    scientificName: { type: String, required: true, trim: true },
    nickName: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["tropical", "desertica", "templada", "alpina"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Plant = mongoose.model("plants", plantSchema, "plants");
