import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

// Create or get a one-to-one conversation between two users
export const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: "participantId required" });

    // Try to find existing conversation containing both users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [currentUserId, participantId] });
    }

    await conversation.populate("participants", "firstName lastName profileImage userName lastSeen");
    res.json(conversation);
  } catch (error) {
    console.error("createOrGetConversation", error);
    res.status(500).json({ error: "Failed to create or fetch conversation" });
  }
};

// Get all conversations for logged-in user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
      const conversations = await Conversation.find({ participants: userId })
        .populate("participants", "firstName lastName profileImage userName lastSeen")
        .populate("lastMessageSender", "firstName lastName profileImage")
        .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("getConversations", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
};

// Get messages for a conversation with pagination
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(10, parseInt(req.query.limit || "20", 10));

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "firstName lastName profileImage");

    // Return messages in chronological order
    res.json({ messages: messages.reverse(), page, limit });
  } catch (error) {
    console.error("getMessages", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

// Send message via REST (also saved to DB)
export const sendMessage = async (req, res) => {
  try {
    const sender = req.userId;
    const { conversationId, text } = req.body;
    if (!conversationId || !text) return res.status(400).json({ message: "conversationId and text required" });

    const message = await Message.create({ conversationId, sender, text });

    // update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageSender: sender,
      lastMessageAt: new Date(),
    });

    const populated = await message.populate("sender", "firstName lastName profileImage");
    res.json({ message: populated });
  } catch (error) {
    console.error("sendMessage", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark messages as seen by the logged-in user
export const markMessagesSeen = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, messageIds } = req.body;
    if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: "conversationId and messageIds[] required" });
    }

    const result = await Message.updateMany(
      { _id: { $in: messageIds }, conversationId },
      { $addToSet: { seenBy: userId } }
    );

    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (error) {
    console.error("markMessagesSeen", error);
    res.status(500).json({ error: "Failed to mark messages seen" });
  }
};
