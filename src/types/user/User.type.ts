//? UserType is my mapping of the User mongoose document

import { Types } from "mongoose";

export interface User {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  imgPath: string;
  imgPublicUrl: string;
  plant_care_skill_level: string;
  role: string;
  plants: Types.ObjectId[];
}

//? Type for the user format sent by the user in register request
export type NewUser = Omit<User, "_id" | "role" | "imgPath" | "imgPublicUrl" | "plants">;
//? Type for user update
export type UpdatedUser = Omit<User, "_id" | "role" | "password" | "plants">
//? Type for all API responses
export type PublicUser = Omit<User, "password">;
//? Type for search by username response
export type UserProfile = Pick<User, "username" | "plant_care_skill_level" | "plants">;
