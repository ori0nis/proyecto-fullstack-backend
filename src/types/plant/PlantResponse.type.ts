//? Data type is generic to allow both for Plant[] response (getAllPlants) and Plant response (getPlantById). Data is T or null to be able to use PlantResponse in error responses

export interface PlantResponse<T> {
  data: T | null;
  message: string;
  status?: number;
}
