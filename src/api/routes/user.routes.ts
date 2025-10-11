import express from "express";
import {
  canChangePassword,
  canDeleteUserPlant,
  canEditOrDeleteUser,
  canEditUserPlant,
  isAdmin,
  isAuth,
  isUniqueUser,
  refreshToken,
} from "../../middlewares/index.js";
import {
  addPlantToProfile,
  changePassword,
  deleteUser,
  deleteUserPlant,
  editUser,
  editUserPlant,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  loginUser,
  logoutUser,
  registerUser,
  uploadProfilePicture,
  verifyUserAuth,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const userRouter = express.Router();

userRouter.post("/register", isUniqueUser, registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", isAuth, verifyUserAuth);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.get("/search/all-users", isAuth, isAdmin, getAllUsers);
userRouter.get("/search/user/id", isAuth, isAdmin, getUserById);
userRouter.get("/search/user/email", isAuth, isAdmin, getUserByEmail);
userRouter.get("/search/user/username", isAuth, getUserByUsername);
userRouter.post("/user/profile/new-plant", isAuth, upload.single("imgPath"), addPlantToProfile);
userRouter.put("/profile/plant/:plantId", isAuth, canEditUserPlant, upload.single("imgPath"), editUserPlant);
userRouter.put("/user/:id", isAuth, canEditOrDeleteUser, editUser);
userRouter.patch("/user/:id/change-password", isAuth, canChangePassword, changePassword);
userRouter.patch("/user/:id/profile-picture", isAuth, canEditOrDeleteUser, upload.single("imgPath"), uploadProfilePicture);
userRouter.put("/profile/plant/:plantId", isAuth, canDeleteUserPlant, deleteUserPlant);
userRouter.delete("/user/:id", isAuth, canEditOrDeleteUser, deleteUser);
