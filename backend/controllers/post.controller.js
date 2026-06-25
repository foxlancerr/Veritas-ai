import uploadOnCloudinary from "../config/cloudinary.js";
import { io } from "../index.js";
import Post from "../models/post.model.js";
import { getUserRoom } from "../config/socket.js";
import { createAndPopulateNotification } from "./notification.controllers.js";
import { fakeDetectionPost } from "../config/aiModal.js";
// controller for creating a post
export const createPost = async (req, res) => {
  try {
    const { description } = req.body;

    // check the post is safe or not using groq moderation
    const moderation = await fakeDetectionPost(description, 300);

    if (!moderation.approved) {
      return res.status(400).json({
        success: false,
        message: moderation.reason || "Post violates guidelines",
        moderation,
      });
    }
    let newPost;
    if (req.file) {
      const image = await uploadOnCloudinary(req.file.path);
      newPost = await Post.create({
        author: req.userId,
        description,
        image,
      });
    } else {
      newPost = await Post.create({
        author: req.userId,
        description,
      });
    }

    // Populate author so every client can render the card immediately
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "firstName lastName profileImage headline userName")
      .populate("comment.user", "firstName lastName profileImage headline");

    // Broadcast to every connected client so the feed updates in real-time
    io.emit("newPost", populatedPost);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
      moderation,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
      error: error.message,
    });
  }
};

// controller for getting all posts
export const getALlPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstName lastName profileImage headline userName")
      .populate("comment.user", "firstName lastName profileImage headline")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
};

// controller for like the posts
export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId); // ✅ FIXED

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle like — use .toString() comparison to handle ObjectId vs string safely
    const alreadyLiked = post.like.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      // Already liked → unlike
      post.like = post.like.filter((id) => id.toString() !== userId.toString());
    } else {
      // Not liked → like it
      post.like.push(userId);
      if (post.author.toString() !== userId.toString()) {
        const notification = await createAndPopulateNotification({
          receiver: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        io.to(getUserRoom(post.author.toString())).emit("newNotification", notification);
      }
    }

    await post.save();
    io.emit("likeUpdated", { postId, likes: post.like });

    return res.status(200).json({
      success: true,
      message: "Post like updated",
      like: post.like,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to like post",
      error: error.message,
    });
  }
};

// controller for comment the posts
export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    console.log("User ID from token:", req.userId);

    const { content } = req.body;

    // check the post is safe or not using groq moderation
    const moderation = await fakeDetectionPost(content, 300);

    if (!moderation.approved) {
      return res.status(400).json({
        success: false,
        message: moderation.reason || "Post violates guidelines",
        moderation,
      });
    }
    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comment: { content, user: userId } } },
      { new: true },
    )
      .populate("author", "firstName lastName profileImage headline")
      .populate("comment.user", "firstName lastName profileImage headline");
    if (post.author._id.toString() !== userId.toString()) {
      const notification = await createAndPopulateNotification({
        receiver: post.author._id,
        type: "comment",
        relatedUser: userId,
        relatedPost: postId,
      });
      io.to(getUserRoom(post.author._id.toString())).emit("newNotification", notification);
    }
    io.emit("commentAdded", { postId, comm: post.comment });
    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      moderation,
      post,
    });
  } catch (error) {
    console.error("Error commenting on post:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to comment on post",
      error: error.message,
    });
  }
};


export const verifyContentWithAi = async (req, res) => {
  try {
    const postId = req.params.id;

      // 1. Fetch post
    const post = await Post.findById(postId).populate(
      "author",
      "firstName lastName",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const content = post.description || "";

    if (!content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post has no content to verify",
      });
    }

    // check the post is safe or not using groq moderation
    const moderation = await fakeDetectionPost(content, 300);

    if (!moderation.approved) {
      return res.status(400).json({
        success: false,
        message: moderation.reason || "Post violates guidelines",
        moderation,
      });
    }
    // 4. Response
    return res.status(200).json({
      success: true,
      moderation,
    });
  } catch (error) {
    console.error("Error in verifyContentWithAi:", error);
    return res.status(500).json({
      success: false,
      message: "AI verification failed",
      error: error.message,
    });
  }
};
