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
export type NewUser = Omit<User, "_id" | "role">;
//? Type for the 200 OK response after register and login
export type PublicUser = Omit<User, "role" | "password">;
