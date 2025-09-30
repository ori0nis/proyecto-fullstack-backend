import { PublicUserType } from "./UserType.type.js";

export interface LoginResponse {
  token: string;
  user: PublicUserType;
}
