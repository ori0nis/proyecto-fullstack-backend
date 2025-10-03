import axios from "axios";

export const isValidScientificName = async (name: string): Promise<boolean> => {
  try {
    const response = await axios.get("https://api.gbif.org/v1/species/match", { params: { name } });

    const { usageKey, status, matchType } = response.data;

    return usageKey !== null && status === "ACCEPTED" && matchType === "EXACT";
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("GBIF API error: ", error);
    } else {
      console.error("Unknown error validating plant name: ", error);
    }
    return false;
  }
};
