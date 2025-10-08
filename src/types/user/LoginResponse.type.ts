import { PublicUser } from "./User.type.js";

export interface LoginResponse {
  token: string;
  user: PublicUser;
}
