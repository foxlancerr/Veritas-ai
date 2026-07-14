// backend/socket.js (or wherever you handle socket connections)
import { Server } from "socket.io";
import { verifyToken } from "./genToken.js";
import { processChatMessage } from "../controllers/chatbot.controllers.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const userSocketMap = new Map();
export const getUserRoom = (userId) => `user:${userId}`;
export const getConversationRoom = (conversationId) => `conversation:${conversationId}`;

const addSocketToUser = (userId, socketId) => {
  const sockets = userSocketMap.get(userId) ?? new Set();
  sockets.add(socketId);
  userSocketMap.set(userId, sockets);
  return sockets.size;
};

const removeSocketFromUser = (userId, socketId) => {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return 0;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSocketMap.delete(userId);
    return 0;
  }
  userSocketMap.set(userId, sockets);
  return sockets.size;
};

const getOnlineUsers = () => Array.from(userSocketMap.keys());

const getIdString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) {
      return value._id.toString();
    }
    if (value.toString && value.toString !== Object.prototype.toString) {
      const stringValue = value.toString();
      if (stringValue && stringValue !== "[object Object]") {
        return stringValue;
      }
    }
  }
  return null;
};

const broadcastMessageStatus = (io, conversationId, message) => {
  const payload = { messageId: message._id, message };
  const senderId = getIdString(message.sender);
  const receiverId = getIdString(message.receiver);

  if (senderId) {
    io.to(getUserRoom(senderId)).emit("message-status-changed", payload);
  }

  if (receiverId) {
    io.to(getUserRoom(receiverId)).emit("message-status-changed", payload);
  }

  if (conversationId) {
    io.to(getConversationRoom(conversationId)).emit("message-status-changed", payload);
  }
};

export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = verifyToken(token); // returns decoded user object
      socket.userId = decoded._id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId?.toString();

    if (userId) {
      socket.join(getUserRoom(userId));
      const totalSockets = addSocketToUser(userId, socket.id);
      if (totalSockets === 1) {
        io.emit("userOnline", { userId });
      }
      // send current online users list to the connected socket
      socket.emit("onlineUsers", getOnlineUsers());
      // update lastSeen to null (now online)
      User.findByIdAndUpdate(userId, { lastSeen: null }).catch(() => {});
    }

    socket.on("register", () => {
      const userId = socket.userId?.toString();
      if (!userId) return;
      socket.join(getUserRoom(userId));
      addSocketToUser(userId, socket.id);
      socket.emit("onlineUsers", getOnlineUsers());
    });

    socket.on("joinConversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(getConversationRoom(conversationId));
    });

    socket.on("conversation-opened", async ({ conversationId }) => {
      if (!conversationId) return;

      socket.activeConversationId = conversationId;
      socket.join(getConversationRoom(conversationId));

      const unreadMessages = await Message.find({
        conversationId,
        receiver: socket.userId,
        status: { $ne: "read" },
      });

      if (!unreadMessages.length) return;

      const unreadMessageIds = unreadMessages.map((message) => message._id);
      const updatedMessages = await Message.updateMany(
        { _id: { $in: unreadMessageIds }, status: { $ne: "read" } },
        { $set: { status: "read", readAt: new Date() } }
      );

      if (!updatedMessages.modifiedCount && !updatedMessages.nModified) return;

      const populatedMessages = await Message.find({ _id: { $in: unreadMessageIds } }).populate([
        { path: "sender", select: "firstName lastName profileImage" },
        { path: "receiver", select: "firstName lastName profileImage" },
      ]);

      populatedMessages.forEach((message) => {
        broadcastMessageStatus(io, conversationId, message);
      });
    });

    socket.on("conversation-closed", ({ conversationId }) => {
      if (socket.activeConversationId && socket.activeConversationId.toString() === conversationId?.toString()) {
        socket.activeConversationId = null;
      }
    });

    const handleSendMessage = async (data) => {
      try {
        const { conversationId, text } = data;
        if (!conversationId || !text) return;

        const conversation = await Conversation.findById(conversationId).select("participants");
        if (!conversation) return;

        const receiver = conversation.participants.find((participantId) => participantId.toString() !== socket.userId.toString());
        if (!receiver) return;

        const msg = await Message.create({
          conversationId,
          sender: socket.userId,
          receiver,
          text,
          status: "sent",
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageSender: socket.userId,
          lastMessageAt: new Date(),
        });

        const populated = await msg.populate([
          { path: "sender", select: "firstName lastName profileImage" },
          { path: "receiver", select: "firstName lastName profileImage" },
        ]);

        io.to(getConversationRoom(conversationId)).emit("newMessage", { message: populated });

        conversation.participants.forEach((participantId) => {
          const id = participantId.toString();
          io.to(getUserRoom(id)).emit("conversationUpdated", { conversationId, lastMessage: text, lastMessageAt: new Date() });
        });
      } catch (error) {
        console.error("socket sendMessage error:", error);
      }
    };

    socket.on("sendMessage", handleSendMessage);
    socket.on("send-message", handleSendMessage);

    const handleMessageDelivered = async ({ messageId }) => {
      try {
        if (!messageId) return;

        const updatedMessage = await Message.findOneAndUpdate(
          {
            _id: messageId,
            receiver: socket.userId,
            status: { $in: ["sent"] },
          },
          { status: "delivered", deliveredAt: new Date() },
          { new: true }
        ).populate([
          { path: "sender", select: "firstName lastName profileImage" },
          { path: "receiver", select: "firstName lastName profileImage" },
        ]);

        if (updatedMessage) {
          broadcastMessageStatus(io, updatedMessage.conversationId, updatedMessage);
        }
      } catch (error) {
        console.error("socket messageDelivered error:", error);
      }
    };

    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("message-delivered", handleMessageDelivered);

    const handleMessageRead = async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId) return;

        const query = { conversationId, receiver: socket.userId, status: { $ne: "read" } };
        if (Array.isArray(messageIds) && messageIds.length) {
          query._id = { $in: messageIds };
        }

        const unreadMessages = await Message.find(query);
        if (!unreadMessages.length) return;

        const unreadMessageIds = unreadMessages.map((message) => message._id);
        const updatedMessages = await Message.updateMany(
          { _id: { $in: unreadMessageIds } },
          { $set: { status: "read", readAt: new Date() } }
        );

        if (!updatedMessages.modifiedCount && !updatedMessages.nModified) return;

        const populatedMessages = await Message.find({ _id: { $in: unreadMessageIds } }).populate([
          { path: "sender", select: "firstName lastName profileImage" },
          { path: "receiver", select: "firstName lastName profileImage" },
        ]);

        populatedMessages.forEach((message) => {
          broadcastMessageStatus(io, conversationId, message);
        });
      } catch (error) {
        console.error("socket messageRead error:", error);
      }
    };

    socket.on("messageRead", handleMessageRead);
    socket.on("message-read", handleMessageRead);

    // typing indicator
    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(getConversationRoom(conversationId)).emit("typing", { userId: socket.userId, conversationId });
    });

    socket.on("stopTyping", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(getConversationRoom(conversationId)).emit("stopTyping", { userId: socket.userId, conversationId });
    });

    // mark messages as seen
    socket.on("messageSeen", async ({ conversationId, messageIds }) => {
      try {
        if (!conversationId || !Array.isArray(messageIds)) return;
        await Message.updateMany({ _id: { $in: messageIds }, conversationId }, { $addToSet: { seenBy: socket.userId } });
        io.to(getConversationRoom(conversationId)).emit("messageSeen", { userId: socket.userId, messageIds });
      } catch (error) {
        console.error("socket messageSeen error:", error);
      }
    });

    socket.on("chat-message", async (data) => {
      // keep previous chatbot compatibility
      const { message, intent } = data;
      try {
        const reply = await processChatMessage(socket.userId, message, intent);
        socket.emit("bot-reply", { content: reply });
      } catch (error) {
        socket.emit("bot-reply", {
          content: "Sorry, I'm having trouble right now. Please try again.",
        });
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.userId?.toString();
      if (userId) {
        const remainingSockets = removeSocketFromUser(userId, socket.id);
        if (remainingSockets === 0) {
          io.emit("userOffline", { userId });
          // set lastSeen timestamp
          await User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
        }
      }
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}
