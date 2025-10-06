//? Image gets uploaded to Supabase bucket, path gets built with a UUID and we receive the file's public URL

import { supabase } from "../config/index.js";
import { v4 as uuid } from "uuid";

interface UploadResult {
  imgPath: string;
  publicUrl: string;
}

export const supabaseUpload = async (file: Express.Multer.File): Promise<UploadResult> => {
  const filePath = `users/${uuid()}-${file.originalname}`;

  const { error } = await supabase.storage.from("images").upload(filePath, file.buffer, {
    contentType: file.mimetype,
  });

  if (error) throw new Error("Error uploading your image: ", error);

  const { data } = supabase.storage.from("images").getPublicUrl(filePath);

  return { imgPath: filePath, publicUrl: data.publicUrl };
};
