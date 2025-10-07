import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../../types/user/index.js";

const lowSecurityPassword: string[] = ["123", "abc", "qwerty", "password", "admin", "user", "login"];

const userSchema = new mongoose.Schema<User>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      validate: {
        validator: (value: string) => /^\S+@\S+\.\S+$/.test(value),
        message: "Email format is invalid",
      },
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      trim: true,
      minlength: [8, "Password must contain at least 8 characters"],
      validate: [
        {
          validator: (value: string) => value === value.trim(),
          message: "Password can't contain spaces at the start or end",
        },
        {
          validator: (value: string) => /[a-z]/.test(value),
          message: "Password must contain at least one lowercase character",
        },
        {
          validator: (value: string) => /[A-Z]/.test(value),
          message: "Password must contain at least one uppercase character",
        },
        {
          validator: (value: string) => /\d/.test(value),
          message: "Password must contain at least one number",
        },
        {
          validator: (value: string) => /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value),
          message: "Password must contain at least one special character",
        },
        {
          validator: (value: string) => !lowSecurityPassword.includes(value),
          message: "Password is too insecure",
        },
      ],
    },
    imgPath: { type: String, required: false, trim: true },
    imgPublicUrl: { type: String, required: false, trim: true },
    plant_care_skill_level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "Demeter"],
      required: [true, "Please provide a valid plant care skill level: beginner, intermediate, advanced"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // User always as role user by default
      required: false,
      trim: true,
    },
    plants: [{ type: Types.ObjectId, ref: "userplants", required: false }],
  },
  {
    timestamps: true,
    strict: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    }
  } catch (error) {
    next(error as Error);
  }
});

export const UserModel = mongoose.model("users", userSchema, "users");
