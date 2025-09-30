//? req.user is always double checked even after passing isAuth(), as a good practice

import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import {
  NewUserType,
  UserResponseType,
  UserType,
  LoginResponse,
  LoginUserType,
  PublicUserType,
} from "../../types/user/index.js";
import { User } from "../models/index.js";
import { generateToken } from "../../utils/jwt/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { supabaseUpload } from "../../middlewares/index.js";

// GET ALL USERS
export const getAllUsers = async (
  req: AuthRequest,
  res: Response<UserResponseType<PublicUserType[]>>,
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

    const users = await User.find().populate("plants").lean<UserType[]>();
    const publicUsers = users.map(({ password, role, ...rest }) => rest) as PublicUserType[];

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
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userInDatabase = await User.findById(id).populate("plants").lean<UserType>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });
    } else {
      const { password, role, ...publicUser } = userInDatabase;

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
  req: Request<{}, {}, NewUserType>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, password, img, plant_care_skill_level, plants } = req.body;

    // Role is enforced again to avoid overwrites
    const user = new User({ username, email, password, img, plant_care_skill_level, plants, role: "user" });

    if (req.file) {
      const img = await supabaseUpload(req.file);
      user.img = img;
    }

    // First we save the mongoose document, then we translate it to plain object so that it can be sent as response with PublicUserType
    const savedUser = await (await user.save()).populate("plants");
    const userPosted = savedUser.toObject() as PublicUserType;

    res.status(201).json({
      message: "User created",
      status: 201,
      data: userPosted,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const loginUser = async (
  req: Request<{}, {}, LoginUserType>,
  res: Response<UserResponseType<LoginResponse>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate("plants");

    if (!user) {
      res.status(401).json({
        message: "Email or password do not match",
        status: 401,
        data: null,
      });

      return;
    }

    const passwordMatches = bcrypt.compareSync(req.body.password, user.password);

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

    const { password, role, ...publicUser } = user.toObject();

    res.status(200).json({
      message: "User logged in with token",
      status: 200,
      data: {
        token,
        user: publicUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// EDIT USER
// TODO: Check out img edition logic with supabase
export const editUser = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewUserType>>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userInDatabase = await User.findById(id).populate("plants").lean<UserType>();

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
    if ("role" in updates) {
      delete updates.role;
    }

    const userUpdated = await User.findByIdAndUpdate(id, updates, { new: true }).populate("plants").lean<UserType>();

    if (!userUpdated) {
      res.status(500).json({
        message: "Error updating user",
        status: 500,
        data: null,
      });

      return;
    }

    const { password, role, ...publicUser } = userUpdated;

    res.status(200).json({
      message: "User updated",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER
// TODO: Img deletion util
export const deleteUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      res.status(401).json({
        message: "Unauthorized",
        status: 401,
        data: null,
      });

      return;
    }

    const userInDatabase = await User.findById(id).lean<UserType>();

    if (!userInDatabase) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const userDeleted = await User.findByIdAndDelete(id).populate("plants").lean<UserType>();

    if (!userDeleted) {
      res.status(500).json({
        message: "Error deleting user",
        status: 500,
        data: null,
      });

      return;
    }

    const { password, role, ...publicUser } = userDeleted;

    res.status(200).json({
      message: "User deleted",
      status: 200,
      data: publicUser,
    });
  } catch (error) {
    next(error);
  }
};
