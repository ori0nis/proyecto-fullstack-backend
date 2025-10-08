//? PlantType refers to plant data received with the controller response (once plant has been found/saved/updated/deleted in database), and NewPlant refers to plant sent within the req.body in POST (it shouldn't include an _id)

import { Types } from "mongoose";

export interface Plant {
  _id: Types.ObjectId;
  scientific_name: string;
  common_name: string;
  imgPath: string;
  imgPublicUrl: string;
  type: "tropical" | "desert" | "temperate" | "alpine" | "aquatic";
}

export type NewPlant = Omit<Plant, "_id">;
