import { Request, Response, NextFunction } from "express";
import { NewUserType, UserType, UserResponseType } from "../types/user/index.js";
import { User } from "../api/models/User.model.js";

export const validateUser = async (
  req: Request<{}, {}, NewUserType>,
  res: Response<UserResponseType<UserType>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    const usernameTaken = await User.findOne({ username: req.body.username });
    const allowedSkills = ["beginner", "intermediate", "advanced", "Demeter"];

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

    if (!allowedSkills.includes(req.body.plant_care_skill_level)) {
      res.status(400).json({
        message: "Plant care skill level is invalid",
        status: 400,
        data: null,
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
