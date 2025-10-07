import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { mongooseConnection, supabase } from "./config/index.js";
import { plantRouter, userRouter } from "./api/routes/index.js";

interface CustomError extends Error {
  status?: number;
}

// Dotenv and port
dotenv.config();
const PORT = process.env.APP_PORT || 4000;

// App, mongoose and supabase
const app = express();
mongooseConnection();
(async () => {
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error("❌ Supabase connection failed: ", error.message);
  } else {
    console.log(
      "✅ Successfully connected to Supabase. Buckets: ",
      data.map((b) => b.name)
    );
  }
})();

// Response handlers
app.use(express.json());
app.use(cors());

// Router and endpoints
const router = express.Router();
router.get("/", (req, res, next) => {
  res.send("🌱 Welcome to the MyPlants.io API!");
});
app.use("/", router);
app.use("/users", userRouter);
app.use("/plants", plantRouter);

// Port listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});

// Express error handler
app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Unexpected error occurred";
  res.status(status).json({ message });
});

// Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("Route not found");
  error.status = 404;
  next(error);
});
