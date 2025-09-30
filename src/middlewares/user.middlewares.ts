import { Request, Response, NextFunction } from "express";
import { NewUserType, UserResponseType, PublicUserType } from "../types/user/index.js";
import { User } from "../api/models/index.js";

//? Checks what the mongoose model can't (unique username and email)
export const isUniqueUser = async (
  req: Request<{}, {}, NewUserType>,
  res: Response<UserResponseType<PublicUserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    const usernameTaken = await User.findOne({ username: req.body.username });

    if (userExists) {
      res.status(409).json({
        message: "An account with this email already exists",
        status: 409,
        data: null,
      });

      return;
    }

    if (usernameTaken) {
      res.status(409).json({
        message: "Username is already taken",
        status: 409,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

