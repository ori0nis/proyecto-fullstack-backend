import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JWTPayload } from "../types/jwt/index.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET isn't defined in .env");
if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET isn't defined in .env");

export const generateToken = (payload: JWTPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (payload: JWTPayload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyToken = ({ token, refresh = false }: { token: string, refresh?: boolean }) => {
  const secret = refresh ? REFRESH_TOKEN_SECRET : JWT_SECRET;
  return jwt.verify(token, secret);
};
