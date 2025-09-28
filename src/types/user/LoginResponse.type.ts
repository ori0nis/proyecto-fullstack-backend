import { UserType } from "./UserType.type";

export interface LoginResponse {
  token: string;
  user: UserType;
}
