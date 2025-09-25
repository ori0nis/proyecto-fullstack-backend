import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, "Password must contain at least 8 characters"],
    },
    img: { type: String, required: true, trim: true },
    plantCareSkillLevel: {
      type: String,
      enum: ["principiante", "intermedio", "avanzado", "Demeter"],
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // El user siempre tiene el rol user por default
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
