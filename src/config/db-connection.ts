import mongoose from "mongoose";

export const connectDB = async () => {
  const DB_URL = process.env.DB_URL;

  if (!DB_URL) throw new Error("DB_URL isn't defined in .env");

  try {
    const connected = await mongoose.connect(DB_URL);

    if (connected) console.log("Successfully connected to MongoAtlas");
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
};
