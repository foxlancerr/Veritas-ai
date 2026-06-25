import { generateAIContent } from "../config/aiModal.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

const SYSTEM_PROMPT = `You are a concise AI assistant for a LinkedIn-style professional network.
Reply in 2-4 lines maximum. No long paragraphs. Be direct, friendly, and helpful.
For lists, use max 3 short bullet points. Never write introductions or conclusions.`;

// Common filler words to exclude from trending topic extraction
const stopWords = new Set([
  "this", "that", "with", "from", "have", "were", "they", "what", "when",
  "your", "will", "been", "more", "also", "than", "then", "some", "into",
  "their", "there", "which", "about", "would", "could", "should", "after",
  "before", "these", "those", "being", "just", "like", "very", "really",
  "want", "need", "make", "know", "think", "time", "work", "good", "great",
]);

// Fetch real user stats using correct User model fields
const getProfileStats = async (userId) => {
  const user = await User.findById(userId).select(
    "firstName lastName connection headline skills location"
  );
  const posts = await Post.find({ author: userId });
  const totalLikes = posts.reduce((sum, p) => sum + (p.like?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comment?.length || 0), 0);

  return {
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
    connections: user?.connection?.length || 0,
    headline: user?.headline || "No headline set",
    location: user?.location || "",
    skills: user?.skills || [],
    totalPosts: posts.length,
    totalLikes,
    totalComments,
  };
};

// Get user's most recent post with full details
const getLatestPost = async (userId) => {
  const post = await Post.findOne({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "firstName lastName");

  if (!post) return null;

  return {
    content: post.description,
    likes: post.like?.length || 0,
    comments: post.comment?.length || 0,
    timeAgo: getTimeAgo(post.createdAt),
  };
};

// Extract trending topics from last 7 days of posts (extended from 24h)
const getTopTopics = async () => {
  const recentPosts = await Post.find({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })
    .select("description")
    .limit(50);

  if (!recentPosts.length) return null;

  const wordFreq = new Map();
  recentPosts.forEach((post) => {
    const words = post.description.toLowerCase().match(/\b\w{4,}\b/g) || [];
    words.forEach((word) => {
      if (!stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
  });

  const sorted = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]);
  const topics = sorted.slice(0, 5).map(([word]) => word);
  return topics.length ? topics : null;
};

// Search users and posts in parallel
const searchContent = async (query, currentUserId) => {
  const [users, posts] = await Promise.all([
    User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { userName: { $regex: query, $options: "i" } },
      ],
    })
      .limit(5)
      .select("firstName lastName userName headline"),
    Post.find({ description: { $regex: query, $options: "i" } })
      .limit(5)
      .populate("author", "firstName lastName"),
  ]);

  return { users, posts };
};

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function classifyIntent(text) {
  const t = text.toLowerCase().substring(0, 150);
  if (/post idea|what to post|suggest post|content idea|topic idea/i.test(t)) return "post_idea";
  if (/trending|top topic|hot topic|popular topic|what.s popular/i.test(t)) return "top_topics";
  if (/my stat|my profile|follower|analytics|engagement|how.m i doing/i.test(t)) return "profile_stats";
  if (/latest post|last post|recent post|my last/i.test(t)) return "latest_post";
  if (/search|find|look(ing)? for/i.test(t)) return "search";
  return "general";
}

export const processChatMessage = async (userId, message, intent = null) => {
  const resolvedIntent = intent || classifyIntent(message);
  let userPrompt = "";

  switch (resolvedIntent) {
    case "post_idea": {
      const user = await User.findById(userId).select("skills headline firstName");
      const skillsInfo = user?.skills?.length
        ? user.skills.join(", ")
        : "general professional topics";
      const headlineInfo = user?.headline ? `"${user.headline}"` : "a professional";
      userPrompt = `The user (${user?.firstName || "a professional"}) has skills in ${skillsInfo} and their headline is ${headlineInfo}.
Their request: "${message}"
Suggest 3 creative, engaging LinkedIn post ideas as a numbered list. Make them specific, actionable, and professional. Include a short hook line for each.`;
      break;
    }

    case "top_topics": {
      const topics = await getTopTopics();
      if (topics) {
        userPrompt = `These trending topics were detected in recent posts on our professional network: ${topics.join(", ")}.
Tell the user about these trending topics in a friendly, engaging way. Briefly explain why each is relevant for professionals right now.`;
      } else {
        userPrompt = `The user asked about trending professional topics. Our platform is still growing so we don't have enough posts to detect trends yet.
Share 5 currently hot topics in the professional and tech world that would make great LinkedIn posts. Be specific and relevant.`;
      }
      break;
    }

    case "profile_stats": {
      const stats = await getProfileStats(userId);
      userPrompt = `Here are the user's profile stats on our professional network:
- Name: ${stats.name || "Not set"}
- Connections: ${stats.connections}
- Headline: ${stats.headline}
- Location: ${stats.location || "Not set"}
- Skills: ${stats.skills.length ? stats.skills.join(", ") : "None listed"}
- Total posts published: ${stats.totalPosts}
- Total likes received: ${stats.totalLikes}
- Total comments received: ${stats.totalComments}

Present these stats in a friendly, motivating tone. If the numbers are low, encourage them to grow. If they're doing well, celebrate it. Give 1-2 actionable tips to improve their profile.`;
      break;
    }

    case "latest_post": {
      const post = await getLatestPost(userId);
      if (post) {
        userPrompt = `The user's most recent post on our professional network:
Content: "${post.content}"
Likes: ${post.likes}
Comments: ${post.comments}
Posted: ${post.timeAgo}

Summarize this post, highlight what's working, and give 1-2 tips to improve engagement on their next post.`;
      } else {
        userPrompt = `The user hasn't published any posts yet on our professional network.
Encourage them warmly to make their first post. Give 3 easy first-post ideas to help them get started.`;
      }
      break;
    }

    case "search": {
      const searchQuery = message.replace(/search|find|look(ing)? for/gi, "").trim();
      if (!searchQuery) {
        userPrompt = `The user wants to search but hasn't specified what. Ask them what they'd like to find — people by name, posts by topic, or skills.`;
        break;
      }
      const { users, posts } = await searchContent(searchQuery, userId);
      const usersText = users.length
        ? users
            .map(
              (u) =>
                `${u.firstName} ${u.lastName} (@${u.userName})${u.headline ? ` — ${u.headline}` : ""}`
            )
            .join("; ")
        : "No users found";
      const postsText = posts.length
        ? posts
            .map(
              (p) =>
                `"${p.description.substring(0, 80)}..." by ${p.author?.firstName || "Unknown"}`
            )
            .join(" | ")
        : "No posts found";
      userPrompt = `Search results for "${searchQuery}" on our professional network:
People: ${usersText}
Posts: ${postsText}

Present these results in a clear, readable format. If results are empty, suggest how to refine the search.`;
      break;
    }

    default: {
      userPrompt = message;
      break;
    }
  }

  return await generateAIContent(userPrompt, 220, false, SYSTEM_PROMPT);
};

export const httpChatHandler = async (req, res) => {
  try {
    const { message, intent } = req.body;
    const userId = req.user._id;
    const reply = await processChatMessage(userId, message, intent);
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};
