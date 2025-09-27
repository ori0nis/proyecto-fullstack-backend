import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { NewUserType, UserResponseType, UserType } from "../../types/user";
import { User } from "../models";

// GET ALL USERS
export const getAllUsers = async (
  req: Request,
  res: Response<UserResponseType<UserType[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: "Users found",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER BY ID
export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    res.status(200).json({
      message: "User found",
      data: user,
    });
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
    const user = new User(req.body);

    const userPosted = await user.save();

    res.status(201).json({
      message: "User created",
      data: userPosted,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const loginUser = async (
  req: Request<{}, {}, UserType>,
  res: Response<UserResponseType<UserType>>,
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

    if (bcrypt.compareSync(req.body.password, user.password)) {
      // TODO: JWT and isAuth
      // const token =
      res.status(200).json({
        message: "User logged in with token",
        data: user, // token to add
      });
    } else {
      res.status(401).json({
        message: "Email or password do not match",
        status: 401,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

// EDIT USER
export const editUser = async (
  req: Request<{ id: string }, {}, Partial<NewUserType>>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const updatedUser = req.body;

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const userUpdated = await User.findByIdAndUpdate(id, updatedUser, { new: true });

    res.status(200).json({
      message: "User updated",
      data: userUpdated,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE USER
export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
        status: 404,
        data: null,
      });

      return;
    }

    const userDeleted = await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted",
      data: userDeleted,
    });
  } catch (error) {
    next(error);
  }
};
