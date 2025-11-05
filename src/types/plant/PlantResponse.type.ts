//? Data type is generic to allow both for Plant[] response (getAllPlants) and Plant response (getPlantById). Data is T or null to be able to use PlantResponse in error responses

export interface PlantResponse<T> {
  message: string;
  status: number;
  data: {
    plants: T[],
    meta: {
      page: number | null,
      limit: number | null,
      total: number | null,
      hasMore: boolean | null
    } | null
  } | null
}
