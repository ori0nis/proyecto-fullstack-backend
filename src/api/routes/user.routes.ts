import express from "express";
import {
  canChangePassword,
  canEditOrDeleteUser,
  isAdmin,
  isAuth,
  isUniqueUserOnProfileEdit,
  isUniqueUserOnRegister,
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
  getUserPlants,
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
userRouter.get("/user/profile/plants", isAuth, getUserPlants);
// POST
userRouter.post("/register", isUniqueUserOnRegister, registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);
userRouter.post("/user/profile/new-plant", isAuth, upload.single("imgPath"), addPlantToProfile);
userRouter.post("/user/profile/plant/:plantId", isAuth, loadUserPlant, upload.single("imgPath"), editUserPlant); //? Had to change this to POST so that multer would work well (it was leaving requests as pending in frontend)
// PUT
userRouter.put("/user/:id", isAuth, canEditOrDeleteUser, isUniqueUserOnProfileEdit, upload.single("imgPath"), editUser);
// PATCH
userRouter.patch("/user/:id/change-password", isAuth, canChangePassword, changePassword);
// DELETE
userRouter.delete("/user/profile/plant/:plantId", isAuth, loadUserPlant, deleteUserPlant);
userRouter.delete("/user/:id", isAuth, canEditOrDeleteUser, deleteUser);
