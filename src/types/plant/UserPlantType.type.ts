//? Plants that users have in their profiles, taken from the Plants model

import { Types } from "mongoose";

export interface UserPlantType {
  userId: Types.ObjectId;
  plantId: Types.ObjectId;
  nameByUser: string;
  imgPath: string;
  imgPublicUrl: string;
}

export type NewUserPlant = Omit<UserPlantType, "userId">;
