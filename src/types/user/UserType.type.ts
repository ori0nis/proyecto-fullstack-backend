import { Types } from "mongoose";

export interface UserType {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  img: string;
  plant_care_skill_level: string;
  role: string;
  plants: Types.ObjectId[];
}

export type NewUserType = Omit<UserType, "_id">;
