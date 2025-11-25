import { Types } from "mongoose";

export interface UserProfile {
  username: string;
  imgPublicUrl: string;
  plant_care_skill_level: string;
  profile_bio: string;
  plants: Types.ObjectId[];
}
