import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserType } from "../../types/user/index.js";

const lowSecurityPassword: string[] = ["123", "abc", "qwerty", "password", "admin", "user", "login"];

const userSchema = new mongoose.Schema<UserType>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: true,
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
    img: { type: String, required: true, trim: true },
    plant_care_skill_level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "Demeter"],
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // User always as role user by default
      required: true,
      trim: true,
    },
    plants: [{ type: mongoose.Types.ObjectId, ref: "plants" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

export const User = mongoose.model("users", userSchema, "users");
