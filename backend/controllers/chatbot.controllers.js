
// import { generateAIContent } from "../config/aiModal.js";
// import Post from "../models/post.model.js";
// import User from "../models/user.model.js";

// // Helper to get user profile stats
// const getProfileStats = async (userId) => {
//   const user = await User.findById(userId).select("followersCount postsCount totalLikes");
//   const posts = await Post.find({ author: userId });
//   const totalComments = posts.reduce((sum, p) => sum + (p.comment?.length || 0), 0);
//   const totalLikes = posts.reduce((sum, p) => sum + (p.like?.length || 0), 0);
//   return {
//     followers: user?.followersCount || 0,
//     totalPosts: posts.length,
//     totalLikes,
//     totalComments,
//   };
// };

// // Get latest post
// const getLatestPost = async (userId) => {
//   const post = await Post.findOne({ author: userId })
//     .sort({ createdAt: -1 })
//     .populate("author", "firstName lastName userName profileImage");
//   if (!post) return null;
//   return {
//     content: post.description,
//     image: post.image || null,
//     likesCount: post.like?.length || 0,
//     commentsCount: post.comment?.length || 0,
//     createdAt: post.createdAt,
//   };
// };

// // Get top topics (most mentioned keywords in recent posts)
// const getTopTopics = async () => {
//   const recentPosts = await Post.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
//     .select("description");
//   const wordFreq = new Map();
//   recentPosts.forEach(post => {
//     const words = post.description.toLowerCase().split(/\W+/);
//     words.forEach(word => {
//       if (word.length > 3 && !["this","that","with","from","have","were"].includes(word)) {
//         wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
//       }
//     });
//   });
//   const sorted = [...wordFreq.entries()].sort((a,b) => b[1] - a[1]);
//   return sorted.slice(0, 5).map(([word]) => word);
// };

// // Search users and posts
// const searchContent = async (query, currentUserId) => {
//   const users = await User.find({
//     $or: [
//       { firstName: { $regex: query, $options: "i" } },
//       { lastName: { $regex: query, $options: "i" } },
//       { userName: { $regex: query, $options: "i" } }
//     ]
//   }).limit(5).select("firstName lastName userName profileImage headline");
  
//   const posts = await Post.find({
//     description: { $regex: query, $options: "i" }
//   }).limit(5).populate("author", "firstName lastName userName");
  
//   return { users, posts };
// };

// // Generate post idea using Anthropic (returns JSON array)
// const generatePostIdea = async (userPrompt, userContext) => {
//   const prompt = `You are a social media expert. Based on the user's profile (skills: ${userContext.skills?.join(", ") || "none"}, headline: ${userContext.headline || "none"}) and their request: "${userPrompt}", suggest 3 engaging post ideas for a professional network (like LinkedIn). Return ONLY a JSON array of strings, no extra text. Example: ["Idea 1", "Idea 2", "Idea 3"]`;
//   const response = await generateAIContent(prompt, 500);
//   // Try to parse JSON
//   try {
//     const ideas = JSON.parse(response);
//     return Array.isArray(ideas) ? ideas : [response];
//   } catch {
//     // Fallback: split by newlines or return as single idea
//     return response.split('\n').filter(line => line.trim().length > 0);
//   }
// };

// // Main controller for processing any chat message
// export const processChatMessage = async (userId, message, intent = null) => {
//   // 1. Determine intent if not provided
//   let resolvedIntent = intent;
//   if (!resolvedIntent) {
//     resolvedIntent = classifyIntent(message);
//   }

//   // 2. Fetch relevant data based on intent
//   let contextData = {};
//   let systemPrompt = "You are a helpful assistant for a professional social network. Answer concisely and naturally based on the provided data.";

//   switch (resolvedIntent) {
//     case "post_idea":
//       const user = await User.findById(userId);
//       const ideas = await generatePostIdea(message, { skills: user.skills, headline: user.headline });
//       contextData = { postIdeas: ideas };
//       systemPrompt += " Return the post ideas as a friendly bullet list.";
//       break;
//     case "top_topics":
//       const topics = await getTopTopics();
//       contextData = { trendingTopics: topics };
//       break;
//     case "profile_stats":
//       const stats = await getProfileStats(userId);
//       contextData = { stats };
//       break;
//     case "latest_post":
//       const latest = await getLatestPost(userId);
//       contextData = { latestPost: latest };
//       break;
//     case "search":
//       const searchQuery = message.replace(/search/i, "").trim();
//       const results = await searchContent(searchQuery, userId);
//       contextData = { searchResults: results };
//       break;
//     default: // general chat
//       contextData = { note: "The user wants a general conversation. Respond helpfully without specific data." };
//       break;
//   }

//   // 3. Build prompt for Anthropic
//   const userPrompt = `User asked: "${message}"\n\nRelevant data:\n${JSON.stringify(contextData, null, 2)}\n\nProvide a helpful, concise answer.`;
//   const fullPrompt = systemPrompt + "\n\n" + userPrompt;
  
//   // Call your existing generateAIContent (Anthropic) with a reasonable token limit
//   const reply = await generateAIContent(fullPrompt, 600);
//   return reply;
// };

// // Simple keyword-based intent classifier (fallback)
// function classifyIntent(text) {
//   const t = text.toLowerCase();
//   if (t.includes("post idea") || t.includes("what to post") || t.includes("suggest post")) return "post_idea";
//   if (t.includes("trending") || t.includes("top topic") || t.includes("hot topic")) return "top_topics";
//   if (t.includes("stat") || t.includes("follower") || t.includes("like count") || t.includes("engagement")) return "profile_stats";
//   if (t.includes("latest post") || t.includes("last post") || t.includes("recent post")) return "latest_post";
//   if (t.includes("search") || t.includes("find") || t.includes("looking for")) return "search";
//   return "general";
// }

// // Optional: HTTP endpoint controller (if you want REST fallback)
// export const httpChatHandler = async (req, res) => {
//   try {
//     const { message, intent } = req.body;
//     const userId = req.user._id; // from auth middleware
//     const reply = await processChatMessage(userId, message, intent);
//     res.json({ reply });
//   } catch (error) {
//     console.error("Chatbot error:", error);
//     res.status(500).json({ error: "Failed to process message" });
//   }
// };


import { generateAIContent } from "../config/aiModal.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

// Helper to get user profile stats (concise version)
const getProfileStats = async (userId) => {
  const user = await User.findById(userId).select("followersCount postsCount totalLikes");
  const posts = await Post.find({ author: userId });
  const totalComments = posts.reduce((sum, p) => sum + (p.comment?.length || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.like?.length || 0), 0);
  
  // Return concise stats
  return `📊 ${user?.followersCount || 0} followers, ${posts.length} posts, ${totalLikes} likes, ${totalComments} comments`;
};

// Get latest post (concise version)
const getLatestPost = async (userId) => {
  const post = await Post.findOne({ author: userId })
    .sort({ createdAt: -1 })
    .populate("author", "firstName lastName");
  
  if (!post) return "No posts yet";
  
  const timeAgo = getTimeAgo(post.createdAt);
  return `📝 "${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}" - ${post.like?.length || 0} likes, ${post.comment?.length || 0} comments (${timeAgo})`;
};

// Get top topics (limit to 3 topics, shorter words)
const getTopTopics = async () => {
  const recentPosts = await Post.find({ 
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
  }).select("description").limit(20); // Limit to 20 posts for speed
  
  const wordFreq = new Map();
 
  recentPosts.forEach(post => {
    const words = post.description.toLowerCase().match(/\b\w{4,}\b/g) || []; // Only words 4+ chars
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });
  });
  
  const sorted = [...wordFreq.entries()].sort((a,b) => b[1] - a[1]);
  const topics = sorted.slice(0, 3).map(([word]) => word);
  
  return topics.length ? `🔥 ${topics.join(", ")}` : "No trending topics yet";
};

// Search users and posts (concise results)
const searchContent = async (query, currentUserId) => {
  const users = await User.find({
    $or: [
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { userName: { $regex: query, $options: "i" } }
    ]
  }).limit(3).select("firstName lastName userName headline");
  
  const posts = await Post.find({
    description: { $regex: query, $options: "i" }
  }).limit(3).populate("author", "firstName lastName");
  
  let result = "";
  if (users.length) result += `👥 Users: ${users.map(u => `${u.firstName} ${u.lastName}`).join(", ")}. `;
  if (posts.length) result += `📄 Posts: ${posts.map(p => `"${p.description.substring(0, 50)}" by ${p.author.firstName}`).join("; ")}. `;
  
  return result || "No results found";
};

// Generate post idea (concise prompt, minimal tokens)
const generatePostIdea = async (userPrompt, userContext) => {
  // Short, concise prompt
  const prompt = `Suggest 3 short LinkedIn post ideas for ${userContext.skills?.length ? `a ${userContext.skills[0]} professional` : "professional"}. ${userPrompt ? `Topic: ${userPrompt.substring(0, 80)}` : "Make it engaging"}. Return as JSON array of 3 short strings.`;
  
  const response = await generateAIContent(prompt, 200); // Reduced to 200 tokens
  
  try {
    const ideas = JSON.parse(response);
    return Array.isArray(ideas) ? ideas.slice(0, 3) : [response.substring(0, 100)];
  } catch {
    return [response.substring(0, 100)];
  }
};

// Helper: Get time ago string (avoids LLM processing dates)
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

// Main controller - OPTIMIZED for minimal token usage
export const processChatMessage = async (userId, message, intent = null) => {
  // 1. Quick intent classification (no LLM call)
  let resolvedIntent = intent || classifyIntent(message);
  
  // 2. Get concise data based on intent
  let contextText = "";
  let instruction = "";
  
  switch (resolvedIntent) {
    case "post_idea":
      const user = await User.findById(userId).select("skills headline");
      const ideas = await generatePostIdea(message, { 
        skills: user.skills || [], 
        headline: user.headline || "" 
      });
      contextText = `Ideas: ${ideas.join(" | ")}`;
      instruction = "Pick best idea or suggest variation.";
      break;
      
    case "top_topics":
      contextText = await getTopTopics();
      instruction = "Briefly mention these trending topics.";
      break;
      
    case "profile_stats":
      contextText = await getProfileStats(userId);
      instruction = "Share stats concisely.";
      break;
      
    case "latest_post":
      contextText = await getLatestPost(userId);
      instruction = "Describe latest post briefly.";
      break;
      
    case "search":
      const searchQuery = message.replace(/search|find|look for/gi, "").trim();
      contextText = searchQuery ? await searchContent(searchQuery, userId) : "Please provide search term";
      instruction = "Show search results";
      break;
      
    default: // general chat
      contextText = "";
      instruction = "Respond helpfully in 1-2 short sentences.";
      break;
  }
  
  // 3. Build ULTRA-CONCISE prompt (minimal tokens)
  let fullPrompt = "";
  
  if (resolvedIntent === "general") {
    // For general chat, just respond directly
    fullPrompt = `Reply briefly (1 sentence) to: "${message.substring(0, 150)}"`;
  } else {
    // For specific intents, use structured but concise format
    fullPrompt = `Data: ${contextText.substring(0, 300)}\nTask: ${instruction}\nAnswer in 1 short sentence.`;
  }
  
  // 4. Call AI with minimal tokens (200-300 max)
  const reply = await generateAIContent(fullPrompt, 250);
  
  // 5. Ensure response is concise (max 200 chars)
  return reply.length > 250 ? reply.substring(0, 250) + "..." : reply;
};

// Simple keyword-based intent classifier (lightweight, no LLM)
function classifyIntent(text) {
  const t = text.toLowerCase().substring(0, 100); // Only check first 100 chars
  
  // Prioritize specific matches
  if (/post idea|what to post|suggest post|content idea/i.test(t)) return "post_idea";
  if (/trending|top topic|hot topic|popular/i.test(t)) return "top_topics";
  if (/follower|stats|engagement|my profile|analytics/i.test(t)) return "profile_stats";
  if (/latest post|last post|recent post|my last/i.test(t)) return "latest_post";
  if (/search|find|looking for/i.test(t)) return "search";
  
  return "general";
}

// HTTP endpoint controller
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