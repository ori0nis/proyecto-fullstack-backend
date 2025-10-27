import { Types } from "mongoose";

export interface NewUser {
  username: string;
  email: string;
  password: string;
  plant_care_skill_level: string;
  imgPath?: string;
  imgPublicUrl?: string;
  plants?: Types.ObjectId[];
}
