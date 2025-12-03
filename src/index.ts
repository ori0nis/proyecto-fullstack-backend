import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongooseConnection, supabase } from "./config/index.js";
import { plantRouter, userRouter } from "./api/routes/index.js";

interface CustomError extends Error {
  status?: number;
}

// Dotenv and port
dotenv.config();
const PORT = process.env.APP_PORT || 4000;
export const isProduction = process.env.NODE_ENV === "production";

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

// Global log for all requests
app.use((req, res, next) => {
  console.log("💬 New request:", req.method, req.path, req.headers["content-type"]);
  next();
});

// Response handlers and cookies
app.use(express.json());
app.use(cookieParser());

// CORS
const allowedOrigins = ["http://localhost:5173", "https://myplants-backend.onrender.com", "https://myplantsdotio.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Router and endpoints
const router = express.Router();
router.get("/", (req, res, next) => {
  res.send("🌱 Welcome to the MyPlants.io API!");
});
app.use("/", router);
app.use("/users", userRouter);
app.use("/plants", plantRouter);

// Route handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("Route not found");
  error.status = 404;
  next(error);
});

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
