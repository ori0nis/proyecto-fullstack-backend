import express from "express";
import {
  canChangePassword,
  canDeleteUser,
  canDeleteUserPlant,
  canEditUser,
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
  getUserById,
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
userRouter.get("/all-users", isAuth, isAdmin, getAllUsers);
userRouter.get("/user/:id", isAuth, getUserById);
userRouter.post("/user/profile/new-plant", isAuth, upload.single("imgPath"), addPlantToProfile);
userRouter.put("/profile/plant/:plantId", isAuth, canEditUserPlant, upload.single("imgPath"), editUserPlant);
userRouter.put("/user/:id", isAuth, canEditUser, editUser);
userRouter.patch("/user/:id/change-password", isAuth, canChangePassword, changePassword);
userRouter.patch("/user/:id/profile-picture", isAuth, canEditUser, upload.single("imgPath"), uploadProfilePicture);
userRouter.put("/profile/plant/:plantId", isAuth, canDeleteUserPlant, deleteUserPlant);
userRouter.delete("/user/:id", isAuth, canDeleteUser, deleteUser);
