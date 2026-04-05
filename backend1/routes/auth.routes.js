import express from "express";
import {
  loginController,
  logoutController,
  signUpController,
} from "../controllers/auth.controllers.js";
const authRoutes = express.Router();

authRoutes.post("/signup", signUpController);
authRoutes.post("/login", loginController);
authRoutes.get("/logout", logoutController);

export default authRoutes;
