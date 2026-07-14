import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { summarizeConversation, generateReplySuggestions } from "../config/aiModal.js";

// Create or get a one-to-one conversation between two users
export const createOrGetConversation = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: "participantId required" });

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
      .populate("sender", "firstName lastName profileImage")
      .populate("receiver", "firstName lastName profileImage");

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

    const conversation = await Conversation.findById(conversationId).select("participants");
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const receiver = conversation.participants.find((participantId) => participantId.toString() !== sender.toString());
    if (!receiver) return res.status(400).json({ message: "Receiver not found" });

    const message = await Message.create({
      conversationId,
      sender,
      receiver,
      text,
      status: "sent",
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageSender: sender,
      lastMessageAt: new Date(),
    });

    const populated = await message.populate([
      { path: "sender", select: "firstName lastName profileImage" },
      { path: "receiver", select: "firstName lastName profileImage" },
    ]);
    res.json({ message: populated });
  } catch (error) {
    console.error("sendMessage", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Mark messages as read by the logged-in user
export const markMessagesSeen = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, messageIds } = req.body;
    if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ message: "conversationId and messageIds[] required" });
    }

    const result = await Message.updateMany(
      { _id: { $in: messageIds }, conversationId, receiver: userId, status: { $ne: "read" } },
      { $set: { status: "read", readAt: new Date() } }
    );

    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (error) {
    console.error("markMessagesSeen", error);
    res.status(500).json({ error: "Failed to mark messages seen" });
  }
};

// Summarize conversation using AI
export const summarizeConv = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId).select("participants");
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    // Get all messages in the conversation
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName");

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages to summarize" });
    }

    // Generate summary using AI
    const summary = await summarizeConversation(messages);

    if (!summary) {
      return res.status(500).json({ message: "Failed to generate summary" });
    }

    res.json({ success: true, summary });
  } catch (error) {
    console.error("summarizeConv", error);
    res.status(500).json({ error: "Failed to summarize conversation" });
  }
};

// Generate AI-powered reply suggestions based on conversation context
export const getReplySuggestions = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId).select("participants");
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    // Get recent messages (last 20) to provide context
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "firstName lastName");

    if (!messages || messages.length < 1) {
      return res.status(400).json({ message: "No messages to generate suggestions from" });
    }

    // Reverse to get chronological order
    const orderedMessages = messages.reverse();

    // Generate suggestions using AI
    const suggestions = await generateReplySuggestions(orderedMessages);

    if (!suggestions || suggestions.length === 0) {
      return res.status(500).json({ message: "Failed to generate suggestions" });
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("getReplySuggestions", error);
    res.status(500).json({ error: "Failed to generate reply suggestions" });
  }
};
