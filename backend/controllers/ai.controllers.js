import { ANTHROPIC, generateAIContent, queryHFModel } from "../config/aiModal.js";
import { ANTHROPIC_MODEL_NAME } from "../constant/index.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { io } from "../index.js";

export const generateAIComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId; // Provided by your auth middleware

    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const postDescription = `Write a short, engaging LinkedIn comment for this post: "${postExists.description}". Return ONLY the comment text.`;

    // 1. Generate the Comment using Anthropic
    const aiContent = await generateAIContent(postDescription, 100);

    // 2. Update the Database with the new comment
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comment: { content: aiContent, user: userId } } },
      { new: true },
    )
      .populate("author", "firstName lastName profileImage headline")
      .populate("comment.user", "firstName lastName profileImage headline");

    // 3. Create Notification (if the commenter isn't the author)
    if (updatedPost.author._id.toString() !== userId.toString()) {
      await Notification.create({
        receiver: updatedPost.author._id,
        type: "comment",
        relatedUser: userId,
        relatedPost: postId,
      });
    }

    // 4. Emit Socket.io event so other users see the comment immediately
    io.emit("commentAdded", { postId, comm: updatedPost.comment });

    // 5. Send final response to the frontend
    return res.status(200).json({
      success: true,
      message: "AI Comment generated and added successfully",
      suggestion: aiContent, // Useful if you want to show it specifically in a toast
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error in generateAIComment:", error);
    return res.status(500).json({
      success: false,
      message: "AI generation or update failed",
      error: error.message,
    });
  }
};

export const generateAiSuggestion = async (req, res) => {
  try {
    const { aiPrompt } = req.body;

    console.log("Received AI prompt:", aiPrompt);
    if (!aiPrompt) {
      return res.status(400).json({
        success: false,
        message: "AI prompt is required",
      });
    }

    const postDescription = `Write a short, engaging LinkedIn post based on this prompt: "${aiPrompt}". Return ONLY the post text.`;

    // 🔥 Generate post from AI
    // 1. Generate the Comment using Anthropic
    const aiContent = await generateAIContent(postDescription, 300);

    return res.status(200).json({
      success: true,
      message: "AI post generated successfully",
      data: {
        description: aiContent,
      },
    });
  } catch (error) {
    console.error("Error generating AI post:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI post",
    });
  }
};

