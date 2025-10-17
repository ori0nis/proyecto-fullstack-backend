//? req.user is guaranteed through isAuth()

import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import {
  NewUser,
  UserResponse,
  LoginUser,
  PublicUser,
  UserProfile,
  UpdatedUser,
  SingleUserResponse,
  User,
} from "../../types/user/index.js";
import { PlantModel, UserModel, UserPlantModel } from "../models/index.js";
import { generateRefreshToken, generateToken, isAllowedImage } from "../../utils/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { supabaseUpload } from "../../middlewares/index.js";
import { supabase } from "../../config/index.js";
import { NewUserPlant, PlantResponse, UserPlant } from "../../types/plant/index.js";
import { isProduction } from "../../index.js";

// GET ALL USERS
export const getAllUsers = async (
  req: AuthRequest<{}, {}, {}, { page?: string; limit?: string }>,
  res: Response<
    UserResponse<{
      users: PublicUser[];
      meta: { page: number; limit: number; total: number; hasMore: boolean };
    }>
  >,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");

    if (page < 1 || limit < 1 || limit > 100) {
      res.status(400).json({
        message: "Invalid pagination parameters",
        status: 400,
        data: null,
      });

      return;
    }

    const skip = (page - 1) * limit;
    const total = await UserModel.countDocuments();

    const users = await UserModel.find().populate("plants").skip(skip).limit(limit).lean<PublicUser[]>();

    const hasMore = skip + users.length < total;

    res.status(200).json({
      message: "Users found",
      status: 200,
      data: {
        users,
        meta: { page, limit, total, hasMore },
      },
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

    if (!id || id.trim() === "") {
      res.status(400).json({
        message: "Please provide a valid id",
        status: 400,
        data: null,
      });

      return;
    }

    const userInDatabase = await UserModel.findById(id).populate("plants").lean<PublicUser>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User found",
      status: 200,
      data: userInDatabase,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY EMAIL
export const getUserByEmail = async (
  req: AuthRequest<{}, {}, {}, { email: string }>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email || email.trim() === "") {
      res.status(400).json({
        message: "Please provide a valid email",
        status: 400,
        data: null,
      });

      return;
    }

    const userInDatabase = await UserModel.findOne({ email: email }).populate("plants").lean<PublicUser>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User found",
      status: 200,
      data: userInDatabase,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY USERNAME
export const getUserByUsername = async (
  req: AuthRequest<{}, {}, {}, { username: string }>,
  res: Response<UserResponse<UserProfile>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { username } = req.query;

    if (!username || username.trim() === "") {
      res.status(400).json({
        message: "Please provide a valid username",
        status: 400,
        data: null,
      });

      return;
    }

    const userInDatabase = await UserModel.findOne({ username: username }).populate("plants").lean<UserProfile>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User found",
      status: 200,
      data: userInDatabase,
    });
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
  req: Request<{}, {}, LoginUser>,
  res: Response<UserResponse<SingleUserResponse>>,
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
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password, ...publicUser } = user;

    res.status(200).json({
      message: "User logged in with token",
      status: 200,
      data: { 
        user: publicUser 
      },
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY USER AUTH (USED BY THE CUSTOM HOOK IN THE FRONTEND)
export const verifyUserAuth = async (
  req: AuthRequest,
  res: Response<UserResponse<SingleUserResponse>>,
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

    res.status(200).json({
      message: "Authenticated user",
      status: 200,
      data: {
        user: user
      }
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
  req: AuthRequest<{ id: string }, {}, Partial<UpdatedUser>>,
  res: Response<UserResponse<PublicUser>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const profilePic = req.file;

    const updates = { ...req.body } as Partial<UpdatedUser>;

    // Role gets deleted if it's somehow sent in the body
    if ("role" in updates) delete updates.role;

    if (updates.plants) {
      if (!Array.isArray(updates.plants)) {
        updates.plants = [updates.plants];
      }
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

    // Profile pic logic
    if (profilePic) {
      if (userInDatabase.imgPath) {
        const { error: deleteError } = await supabase.storage.from("images").remove([userInDatabase.imgPath]);
        if (deleteError) console.error(deleteError.message);
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

      const { imgPath, imgPublicUrl } = await supabaseUpload(profilePic);

      updates.imgPath = imgPath;
      updates.imgPublicUrl = imgPublicUrl;
    }

    const userUpdated = await UserModel.findByIdAndUpdate(id, updates, { new: true })
      .populate("plants")
      .lean<PublicUser>();

    if (!userUpdated) {
      res.status(500).json({
        message: "Error updating user",
        status: 500,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User updated",
      status: 200,
      data: userUpdated,
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
    const { oldPassword, newPassword } = req.body;

    const userInDatabase = await UserModel.findById(id);

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const passwordMatches = await bcrypt.compare(oldPassword, userInDatabase.password);

    if (!passwordMatches) {
      res.status(400).json({
        message: "Old password is incorrect",
        status: 400,
        data: null,
      });

      return;
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const userUpdated = await UserModel.findByIdAndUpdate(id, { password: newHashedPassword }, { new: true })
      .populate("plants")
      .lean<PublicUser>();

    if (!userUpdated) {
      res.status(500).json({
        message: "Couldn't update user",
        status: 500,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "Password successfully changed",
      status: 200,
      data: userUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// ADD NEW PLANT TO USER PROFILE (preceded by flexiblePlantsearch())
export const addPlantToProfile = async (
  req: AuthRequest<{}, {}, NewUserPlant>,
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

      return;
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

    await isAllowedImage(plantImg).catch((error) => {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid image",
        status: 400,
        data: null,
      });

      return;
    });

    const { imgPath, imgPublicUrl } = await supabaseUpload(plantImg);

    const userPlant = new UserPlantModel({ userId, plantId, nameByUser, imgPath, imgPublicUrl: imgPublicUrl });
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
    const userPlant = req.userPlant!;
    const updates = { ...req.body };

    const plantImg = req.file;
    let imgPath = userPlant.imgPath;
    let imgPublicUrl = userPlant.imgPublicUrl;

    if (plantImg) {
      try {
        await isAllowedImage(plantImg);

        const { error: deleteError } = await supabase.storage.from("images").remove([userPlant.imgPath]);

        // If supabase deletion fails, we log the error but don't terminate execution
        if (deleteError) {
          console.error(deleteError.message);
        }

        const uploaded = await supabaseUpload(plantImg);
        imgPath = uploaded.imgPath;
        imgPublicUrl = uploaded.imgPublicUrl;
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
      userPlant._id,
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
    const userPlant = req.userPlant!;

    const { error: deleteError } = await supabase.storage.from("images").remove([userPlant.imgPath]);

    // If supabase deletion fails, we log the error but don't terminate execution
    if (deleteError) {
      console.error(deleteError.message);
    }

    const plantDeleted = await UserPlantModel.findByIdAndDelete(userPlant._id).lean<UserPlant>();

    if (!plantDeleted) {
      res.status(500).json({
        message: "Error deleting plant",
        status: 500,
        data: null,
      });

      return;
    }

    await UserModel.findByIdAndUpdate(userPlant.userId, { $pull: { plants: plantDeleted._id } });

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

    const userInDatabase = await UserModel.findById(id).populate("plants");

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const { error: deleteError } = await supabase.storage.from("images").remove([userInDatabase.imgPath]);

    // If supabase deletion fails, we log the error but don't terminate execution
    if (deleteError) {
      console.error(deleteError.message);
    }

    const userDeleted = await UserModel.findByIdAndDelete(id).lean<PublicUser>();

    if (!userDeleted) {
      res.status(500).json({
        message: "Error deleting user",
        status: 500,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User deleted",
      status: 200,
      data: userDeleted,
    });
  } catch (error) {
    next(error);
  }
};
