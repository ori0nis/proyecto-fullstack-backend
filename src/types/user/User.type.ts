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
  profile_bio: string;
  role: string;
  plants: Types.ObjectId[];
}

//? Type for user update
export type UpdatedUser = Omit<User, "_id" | "role" | "password" | "plants">
