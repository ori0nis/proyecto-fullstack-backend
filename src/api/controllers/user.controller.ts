//? req.user is always double checked even after passing isAuth(), as a good practice

import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUserType, UserResponseType, UserType, LoginResponse, LoginUserType } from "../../types/user/index.js";
import { User } from "../models/index.js";
import { generateToken } from "../../utils/jwt/index.js";
import { AuthRequest } from "../../types/jwt/index.js";
import { supabaseUpload } from "../../middlewares/supabaseUpload.js";

// GET ALL USERS
export const getAllUsers = async (
  req: AuthRequest,
  res: Response<UserResponseType<UserType[]>>,
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

    const users = await User.find().lean<UserType[]>();

    res.status(200).json({
      message: "Users found",
      status: 200,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
export const getUserById = async (
  req: AuthRequest<{ id: string }>,
  res: Response<UserResponseType<UserType>>,
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
    } else {
      res.status(200).json({
        message: "User found",
        status: 200,
        data: userInDatabase,
      });
    }
  } catch (error) {
    next(error);
  }
};

// REGISTER
export const registerUser = async (
  req: Request<{}, {}, NewUserType>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = new User({
      ...req.body,
      role: "user",
    });

    // First we save the mongoose document, then we translate it to plain object so that it can be typed with UserType
    const userDocument = await user.save();
    await userDocument.populate("plants");

    if (req.file) {
      const img = await supabaseUpload(req.file);
      userDocument.img = img;
      await userDocument.save();
    }

    const userPosted = (await userDocument.save()).toObject() as UserType;

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
    const user = await User.findOne<UserType>({ email: req.body.email }).populate("plants");

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

    res.status(200).json({
      message: "User logged in with token",
      status: 200,
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// EDIT USER
export const editUser = async (
  req: AuthRequest<{ id: string }, {}, Partial<NewUserType>>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedUser = req.body;
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

    const userUpdated = await User.findByIdAndUpdate(id, updatedUser, { new: true }).lean<UserType>();

    res.status(200).json({
      message: "User updated",
      status: 200,
      data: userUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER
export const deleteUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response<UserResponseType<UserType>>,
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

    const userDeleted = await User.findByIdAndDelete(id).lean<UserType>();

    res.status(200).json({
      message: "User deleted",
      status: 200,
      data: userDeleted,
    });
  } catch (error) {
    next(error);
  }
};
