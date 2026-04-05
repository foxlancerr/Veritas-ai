import { queryHFModel } from "../config/aiModal.js";
import Post from "../models/post.model.js";

export const aiModeration = async (req, res, next) => {
  try {
    next();
    return
    const text = req.body.description || req.body.text;
    if (!text)
      return res
        .status(400)
        .json({ success: false, message: "Text is required" });

    // 🔹 Check duplicate posts
    const duplicate = await Post.exists({
      description: { $regex: `^${text.trim()}$`, $options: "i" },
    });

    if (duplicate)
      return res
        .status(400)
        .json({ success: false, message: "Duplicate content detected" });

    // 🔹 Check toxicity

    console.log("Checking toxicity for text:", text);
    const toxicResult = await queryHFModel("unitary/toxic-bert", text);

    if (!toxicResult) {
      console.error("Toxicity check failed for text:", text);
      return res
        .status(500)
        .json({ success: false, message: "Failed to check content" });
    }

    const isToxic = toxicResult?.some((t) => t.score > 0.5);

    // 🔹 Check spam (use Hugging Face spam classifier)
    const spamResult = await queryHFModel(
      "mrm8488/spanish_spam_classifier",
      text,
    );
    if (!spamResult) {
      console.error("Spam check failed for text:", text);
      return res
        .status(500)
        .json({ success: false, message: "Failed to check content" });
    }

    // If any flag is true, block the request
    if (isToxic)
      return res
        .status(400)
        .json({ success: false, message: "This post/comment is toxic" });

    const isSpam = spamResult?.[0]?.label === "spam";

    if (isSpam)
      return res
        .status(400)
        .json({ success: false, message: "This post/comment looks spammy" });

    // If all clear, continue
    next();
  } catch (error) {
    console.error("AI moderation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to check content" });
  }
};
