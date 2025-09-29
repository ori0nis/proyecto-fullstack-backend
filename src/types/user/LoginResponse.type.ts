import { UserType } from "./UserType.type.js";

export interface LoginResponse {
  token: string;
  user: UserType;
}
