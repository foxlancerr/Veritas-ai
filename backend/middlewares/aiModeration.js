import { Filter } from "bad-words";
import stringSimilarity from "string-similarity";
import Post from "../models/post.model.js";
import { spamWordsList } from "../constant/index.js";

const filter = new Filter();

// add custom spam words
filter.addWords(...spamWordsList);

export const aiModeration = async (req, res, next) => {
  try {
    let text = req.body.description || req.body.aiPrompt;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // normalize
    text = text.toLowerCase().trim().replace(/\s+/g, " ");

    // 🔹 1. Toxic + Spam words
    if (filter.isProfane(text)) {
      return res.status(400).json({
        success: false,
        message: "Spam or toxic content detected",
      });
    }

    // 🔹 2. Regex spam detection
    // 🔹 Escape special regex characters
    const escapeRegex = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const spamPattern = new RegExp(
      spamWordsList.map(escapeRegex).join("|"),
      "i",
    );
    if (spamPattern.test(text)) {
      return res.status(400).json({
        success: false,
        message: "Spam detected",
      });
    }

    // 🔹 3. Duplicate / Similarity check
    const posts = await Post.find({}, "description");

    for (let post of posts) {
      const existing = post.description.toLowerCase().trim();

      const similarity = stringSimilarity.compareTwoStrings(text, existing);

      if (similarity > 0.9) {
        return res.status(400).json({
          success: false,
          message: "Duplicate content detected",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Moderation error:", error);

    return res.status(500).json({
      success: false,
      message: "Moderation failed",
    });
  }
};
