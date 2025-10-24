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

// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO
//? Type for user update
export type UpdatedUser = Omit<User, "_id" | "role" | "password" | "plants">
//? Type for search by username response
export type UserProfile = Pick<User, "username" | "plant_care_skill_level" | "plants">;
