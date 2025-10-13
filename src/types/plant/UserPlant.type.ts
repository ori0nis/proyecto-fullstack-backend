//? Plants that users have in their profiles, taken from the Plants model

import { Types } from "mongoose";

export interface UserPlant {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plantId: Types.ObjectId;
  nameByUser: string;
  imgPath: string;
  imgPublicUrl: string;
}

