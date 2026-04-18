import express from "express";
import {
  commentOnPost,
  createPost,
  getALlPosts,
  likePost,
} from "../controllers/post.controller.js";
import upload from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";
import {
  generateAIComment,
  generateAiSuggestion,
} from "../controllers/ai.controllers.js";
// import { aiModeration } from "../middlewares/aiModeration.js";

// Define the post routes
const postRoutes = express.Router();

// Route for creating a post
postRoutes.post(
  "/create-post",
  isAuth,
  upload.single("image"),
  createPost,
);
postRoutes.get("/get-all-posts", isAuth, getALlPosts);
postRoutes.get("/like/:id", isAuth, likePost);
postRoutes.post("/comment/:id", isAuth, commentOnPost);

// ai comment suggestion route
postRoutes.post("/suggest-posts", isAuth, generateAiSuggestion);
postRoutes.get("/suggest-comment/:id", isAuth, generateAIComment);
export default postRoutes;
