import { Types } from "mongoose";

export interface PublicUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  imgPath: string;
  imgPublicUrl: string;
  plant_care_skill_level: string;
  profile_bio: string;
  role: string;
  plants: Types.ObjectId[];
}