import express from "express";
import {
  canChangePassword,
  canEditOrDeleteUser,
  isAdmin,
  isAuth,
  isUniqueUser,
  loadUserPlant,
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
  verifyUserAuth,
} from "../controllers/index.js";
import { upload } from "../../config/index.js";

export const userRouter = express.Router();

// GET
userRouter.get("/me", isAuth, verifyUserAuth);
userRouter.get("/search/all-users", isAuth, isAdmin, getAllUsers);
userRouter.get("/:id", isAuth, isAdmin, getUserById);
userRouter.get("/search/user/email", isAuth, isAdmin, getUserByEmail);
userRouter.get("/search/user/username", isAuth, getUserByUsername);
// POST
userRouter.post("/register", isUniqueUser, registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.post("/user/profile/new-plant", isAuth, upload.single("imgPath"), addPlantToProfile);
// PUT
userRouter.put("/user/profile/plant/:plantId", isAuth, loadUserPlant, upload.single("imgPath"), editUserPlant);
userRouter.put("/user/:id", isAuth, canEditOrDeleteUser, upload.single("imgPath"), editUser);
// PATCH
userRouter.patch("/user/:id/change-password", isAuth, canChangePassword, changePassword);
// DELETE
userRouter.delete("/user/profile/plant/:plantId", isAuth, loadUserPlant, deleteUserPlant);
userRouter.delete("/user/:id", isAuth, canEditOrDeleteUser, deleteUser);

