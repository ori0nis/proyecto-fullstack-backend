export const isAllowedImage = async (img: Express.Multer.File): Promise<boolean> => {
  const allowedTypes = ["image/jpeg", "image/png"];
  const MAX_SIZE = 5 * 1024 * 1024;

  if (!allowedTypes.includes(img.mimetype)) {
    throw new Error("Invalid file type. Please upload a JPEG or PNG");
  }

  if (img.size > MAX_SIZE) {
    throw new Error("File too large. Max size is 5MB");
  }

  return true;
};
