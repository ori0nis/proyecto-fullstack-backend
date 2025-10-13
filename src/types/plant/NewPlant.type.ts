export interface NewPlant {
  scientific_name: string;
  common_name: string;
  type: "tropical" | "desert" | "temperate" | "alpine" | "aquatic";
}
