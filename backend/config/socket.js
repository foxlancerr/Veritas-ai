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

    // Join a conversation room
    socket.on("joinConversation", ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(getConversationRoom(conversationId));
    });

    // Sending a chat message through socket
    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text } = data;
        if (!conversationId || !text) return;

        // persist message
        const msg = await Message.create({ conversationId, sender: socket.userId, text });

        // update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageSender: socket.userId,
          lastMessageAt: new Date(),
        });

        const populated = await msg.populate("sender", "firstName lastName profileImage");

        // emit to all sockets in the conversation room
        io.to(getConversationRoom(conversationId)).emit("newMessage", { message: populated });

        // also notify participant user rooms about updated conversation (list refresh)
        const conv = await Conversation.findById(conversationId).select("participants");
        if (conv && conv.participants && conv.participants.length) {
          conv.participants.forEach((p) => {
            const id = p.toString();
            io.to(getUserRoom(id)).emit("conversationUpdated", { conversationId, lastMessage: text, lastMessageAt: new Date() });
          });
        }
      } catch (error) {
        console.error("socket sendMessage error:", error);
      }
    });

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
