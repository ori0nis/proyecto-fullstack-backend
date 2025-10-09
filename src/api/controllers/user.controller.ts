//? req.user is guaranteed through isAuth()

import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUser, UserResponse, User, LoginUserType, PublicUser } from "../../types/user/index.js";
import { PlantModel, UserModel, UserPlantModel } from "../models/index.js";
import { generateRefreshToken, generateToken, isAllowedImage } from "../../utils/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { supabaseUpload } from "../../middlewares/index.js";
import { supabase } from "../../config/index.js";
import { NewUserPlant, PlantResponse, UserPlant } from "../../types/plant/index.js";

// GET ALL USERS
export const getAllUsers = async (
  req: AuthRequest,
  res: Response<UserResponse<PublicUser[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserModel.find().populate("plants").lean<User[]>();
    const publicUsers = users.map(({ password, role, ...rest }) => rest) as PublicUser[];

    res.status(200).json({
      message: "Users found",
      status: 200,
      data: publicUsers,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
export const getUserById = async (
  req: AuthRequest<{ id: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userInDatabase = await UserModel.findById(id).populate("plants").lean<User>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });
    } else {
      const { password, ...publicUser } = userInDatabase;

      res.status(200).json({
        message: "User found",
        status: 200,
        data: publicUser,
      });
    }
  } catch (error) {
    next(error);
  }
};

// REGISTER
export const registerUser = async (
  req: Request<{}, {}, NewUser>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password, plant_care_skill_level } = req.body;
    // Role is enforced again to avoid overwrites
    const user = new UserModel({ username, email, password, plant_care_skill_level, role: "user" });

    // First we save the mongoose document, then we translate it to plain object so that it can be sent as response with PublicUserType
    const savedUser = await (await user.save()).populate("plants");
    const userPosted = savedUser.toObject();

    const { password: _password, ...publicUser } = userPosted;

    res.status(201).json({
      message: "User created",
      status: 201,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const loginUser = async (
  req: Request<{}, {}, LoginUserType>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await UserModel.findOne({ email: req.body.email }).populate("plants").lean<User>();

    if (!user) {
      res.status(401).json({
        message: "Email or password do not match",
        status: 401,
        data: null,
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatches) {
      res.status(401).json({
        message: "Email or password do not match",
        status: 401,
        data: null,
      });

      return;
    }

    const token = generateToken({
      _id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id.toString(),
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...publicUser } = user;

    res.status(200).json({
      message: "User logged in with token",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY USER AUTH (USED BY THE CUSTOM HOOK IN THE FRONTEND)
export const verifyUserAuth = async (
  req: AuthRequest,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const { password, ...publicUser } = user;

    res.status(200).json({
      message: "Authenticated user",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logoutUser = async (
  req: Request,
  res: Response<UserResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "User logged out successfully",
      status: 200,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT USER
export const editUser = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewUser>>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userInDatabase = await UserModel.findById(id);

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    // Role gets deleted if it's somehow sent in the body
    const updates = { ...req.body };
    if ("role" in updates) delete updates.role;

    const userUpdated = await UserModel.findByIdAndUpdate(id, updates, { new: true }).populate("plants").lean<User>();

    if (!userUpdated) {
      res.status(500).json({
        message: "Error updating user",
        status: 500,
        data: null,
      });

      return;
    }

    const { password, ...publicUser } = userUpdated;

    res.status(200).json({
      message: "User updated",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// CHANGE PASSWORD
export const changePassword = async (
  req: AuthRequest<{ id: string }, {}, { oldPassword: string; newPassword: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const userUpdated = await UserModel.findByIdAndUpdate(id, { password: newHashedPassword }, { new: true })
      .populate("plants")
      .lean<User>();

    if (!userUpdated) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const { password, ...publicUser } = userUpdated;

    res.status(200).json({
      message: "Password successfully changed",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// UPLOAD PROFILE PICTURE
//? Works both for first upload and for edit
export const uploadProfilePicture = async (
  req: AuthRequest<{ id: string }, {}, {}>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
) => {
  try {
    const profilePic = req.file;
    const { id } = req.params;

    if (!profilePic) {
      res.status(400).json({
        message: "No file uploaded",
        status: 400,
        data: null,
      });

      return;
    }

    const userInDatabase = await UserModel.findById(id);

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    // If user already had an image (update option), we remove the old one from supabase
    if (userInDatabase.imgPath) {
      await supabase.storage.from("images").remove([userInDatabase.imgPath]);
    }

    try {
      await isAllowedImage(profilePic);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid image",
        status: 400,
        data: null,
      });

      return;
    }

    const { imgPath, publicUrl } = await supabaseUpload(profilePic);

    const userUpdated = await UserModel.findByIdAndUpdate(
      id,
      { imgPath: imgPath, imgPublicUrl: publicUrl },
      { new: true }
    )
      .populate("plants")
      .lean<User>();

    if (!userUpdated) {
      res.status(500).json({
        message: "Error updating profile picture",
        status: 500,
        data: null,
      });

      return;
    }

    const { password, ...publicUser } = userUpdated;

    res.status(200).json({
      message: "Profile picture updated",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// ADD NEW PLANT TO USER PROFILE
export const addPlantToProfile = async (
  req: AuthRequest<{}, {}, { plantId: string; nameByUser: string }>,
  res: Response<PlantResponse<UserPlant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId, nameByUser } = req.body;

    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });
    }

    const plantInRepository = await PlantModel.findById(plantId);

    if (!plantInRepository) {
      res.status(404).json({
        message: "Plant not found in repository",
        status: 404,
        data: null,
      });

      return;
    }

    const plantImg = req.file;

    if (!plantImg) {
      res.status(400).json({
        message: "No plant image uploaded",
        status: 400,
        data: null,
      });

      return;
    }

    try {
      await isAllowedImage(plantImg);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid image",
        status: 400,
        data: null,
      });

      return;
    }

    const { imgPath, publicUrl } = await supabaseUpload(plantImg);

    const userPlant = new UserPlantModel({ userId, plantId, nameByUser, imgPath, imgPublicUrl: publicUrl });
    const savedUserPlant = await userPlant.save();

    await UserModel.findByIdAndUpdate(userId, { $push: { plants: savedUserPlant._id } });

    res.status(201).json({
      message: "Plant added to user profile",
      status: 201,
      data: savedUserPlant,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT USER PLANT
export const editUserPlant = async (
  req: AuthRequest<{ plantId: string }, {}, Partial<NewUserPlant>>,
  res: Response<PlantResponse<UserPlant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId } = req.params;
    const updates = { ...req.body };

    const userPlant = req.userPlant;

    if (!userPlant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const plantImg = req.file;
    let imgPath = userPlant.imgPath;
    let imgPublicUrl = userPlant.imgPublicUrl;

    if (plantImg) {
      try {
        await isAllowedImage(plantImg);

        const { error: deleteError } = await supabase.storage.from("images").remove([userPlant.imgPath]);

        if (deleteError) {
          res.status(500).json({
            message: "Error deleting plant",
            status: 500,
            data: null,
          });

          return;
        }

        const uploaded = await supabaseUpload(plantImg);
        imgPath = uploaded.imgPath;
        imgPublicUrl = uploaded.publicUrl;
      } catch (error) {
        res.status(400).json({
          message: error instanceof Error ? error.message : "Invalid image",
          status: 400,
          data: null,
        });

        return;
      }
    }

    const plantUpdated = await UserPlantModel.findByIdAndUpdate(
      plantId,
      { ...updates, imgPath, imgPublicUrl },
      { new: true }
    ).lean<UserPlant>();

    res.status(200).json({
      message: "Plant successfully updated",
      status: 200,
      data: plantUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER PLANT
export const deleteUserPlant = async (
  req: AuthRequest<{ plantId: string }>,
  res: Response<PlantResponse<UserPlant>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { plantId } = req.params;
    const userPlant = req.userPlant;

    if (!userPlant) {
      res.status(404).json({
        message: "Plant not found",
        status: 404,
        data: null,
      });

      return;
    }

    const { error: deleteError } = await supabase.storage.from("images").remove([userPlant.imgPath]);

    if (deleteError) {
      res.status(500).json({
        message: "Error deleting image from Supabase",
        status: 500,
        data: null,
      });

      return;
    }

    const plantDeleted = await UserPlantModel.findByIdAndDelete(plantId).lean<UserPlant>();

    if (!plantDeleted) {
      res.status(500).json({
        message: "Error deleting plant",
        status: 500,
        data: null,
      });

      return;
    }

    await UserModel.findByIdAndUpdate(userPlant.userId, { $pull: { plants: plantDeleted.plantId } });

    res.status(200).json({
      message: "Plant deleted",
      status: 200,
      data: plantDeleted,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER
export const deleteUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const userInDatabase = await UserModel.findById(id).lean<User>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const { data, error } = await supabase.storage.from("images").remove([userInDatabase.imgPath]);

    if (error) {
      res.status(500).json({
        message: "Error deleting image from Supabase",
        status: 500,
        data: null,
      });

      return;
    }

    const userDeleted = await UserModel.findByIdAndDelete(id).populate("plants").lean<User>();

    if (!userDeleted) {
      res.status(500).json({
        message: "Error deleting user",
        status: 500,
        data: null,
      });

      return;
    }

    const { password, ...publicUser } = userDeleted;

    res.status(200).json({
      message: "User deleted",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};
