import express from "express";
import {
  commentOnPost,
  createPost,
  getALlPosts,
  likePost,
} from "../controllers/post.controller.js";
import upload from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";

// Define the post routes
const postRoutes = express.Router();

// Route for creating a post
postRoutes.post("/create-post", isAuth, upload.single("image"), createPost);
postRoutes.get("/get-all-posts", isAuth, getALlPosts);
postRoutes.get("/like/:id", isAuth, likePost);
postRoutes.post("/comment/:id", isAuth, commentOnPost);
export default postRoutes;
