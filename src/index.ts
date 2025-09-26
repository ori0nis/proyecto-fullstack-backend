import express, { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config";

interface CustomError extends Error {
  status?: number;
}

dotenv.config();
const PORT = process.env.APP_PORT || 4000;

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

const router = express.Router();
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use((error: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Unexpected error occurred";
  res.status(status).json({ message });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error("Route not found");
  error.status = 404;
  next(error);
});
