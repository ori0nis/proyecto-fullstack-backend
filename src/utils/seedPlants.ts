import dotenv from "dotenv";
import mongoose from "mongoose";
import { Plant } from "../api/models/Plant.model.js";
import { plants } from "../data/plant-list.js";

dotenv.config();

const seedPlants = async () => {
  try {
    const DB_URL = process.env.DB_URL;

    if (!DB_URL) throw new Error("DB_URL doesn't exist in .env");

    await mongoose.connect(DB_URL);
    console.log("✅ Connected to DB");

    await Plant.collection.drop();
    console.log("🧹 Cleared existing plants");

    await Plant.insertMany(plants);
    console.log("🌱 Plants successfully inserted!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "❌ Couldn't complete the database seed";
    console.error(message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
  }
};

seedPlants();
