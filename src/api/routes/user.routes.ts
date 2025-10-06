import express from "express";
import { canChangePassword, canDeleteUser, canEditUser, isAdmin, isAuth, isUniqueUser } from "../../middlewares/index.js";
import {
  changePassword,
  deleteUser,
  editUser,
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
  uploadProfilePicture,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const userRouter = express.Router();

userRouter.post("/register", isUniqueUser, registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/all-users", isAuth, isAdmin, getAllUsers);
userRouter.get("/user/:id", isAuth, getUserById);
userRouter.put("/user/:id", isAuth, canEditUser, editUser);
userRouter.patch("/user/:id/change-password", isAuth, canChangePassword, changePassword);
userRouter.patch("/user/:id/profile-picture", isAuth, canEditUser, upload.single("imgPath"), uploadProfilePicture);
userRouter.delete("/user/:id", isAuth, canDeleteUser, deleteUser);
