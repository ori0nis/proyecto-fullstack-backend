import express from "express";
import { isAuth, isUniqueUser } from "../../middlewares/index.js";
import { deleteUser, editUser, getAllUsers, getUserById, loginUser, registerUser } from "../controllers/index.js";

export const userRouter = express.Router();

userRouter.get("/all-users", isAuth, getAllUsers);
userRouter.get("/user/:id", isAuth, getUserById);
userRouter.post("/register", isUniqueUser, registerUser);
userRouter.post("/login", loginUser);
userRouter.put("/user/:id", isAuth, editUser); // TODO: canEdit middleware
userRouter.delete("/user/:id", isAuth, deleteUser); // TODO: canDelete middleware
