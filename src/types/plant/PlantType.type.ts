//? PlantType refers to plant data received with the controller response (once plant has been found/saved/updated/deleted in database), and NewPlant refers to plant sent within the req.body in POST (it shouldn't include an _id)

import { Types } from "mongoose";

export interface PlantType {
  _id: Types.ObjectId;
  scientific_name: string;
  nick_name: string;
  img: string;
  type: "tropical" | "desert" | "temperate" | "alpine";
}

export type NewPlantType = Omit<PlantType, "_id">;
