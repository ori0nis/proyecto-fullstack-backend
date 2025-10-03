import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JWTPayload } from "../types/jwt/index.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET isn't defined in .env");

export const generateToken = (payload: JWTPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = ({ token }: { token: string }) => {
  return jwt.verify(token, JWT_SECRET);
};
