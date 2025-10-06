import mongoose from "mongoose";

export const mongooseConnection = async () => {
  const DB_URL = process.env.DB_URL;

  if (!DB_URL) throw new Error("❌ DB_URL isn't defined in .env");

  try {
    const connected = await mongoose.connect(DB_URL);

    if (connected) console.log("✅ Successfully connected to MongoAtlas");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ MongoAtlas connection failed: ", message);
  }
};
