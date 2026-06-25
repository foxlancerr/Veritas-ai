// backend/socket.js (or wherever you handle socket connections)
import { Server } from "socket.io";
import { verifyToken } from "./genToken.js";
import { processChatMessage } from "../controllers/chatbot.controllers.js";
// import { processChatMessage } from "../controllers/chatbot.controllers";


export const userSocketMap = new Map();
export const getUserRoom = (userId) => `user:${userId}`;

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
      const decoded = verifyToken(token); // your JWT verify function
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
      socket.emit("onlineUsers", getOnlineUsers());
    }

    socket.on("register", () => {
      const userId = socket.userId?.toString();
      if (!userId) return;
      socket.join(getUserRoom(userId));
      addSocketToUser(userId, socket.id);
      socket.emit("onlineUsers", getOnlineUsers());
    });

    socket.on("chat-message", async (data) => {
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

    socket.on("disconnect", () => {
      const userId = socket.userId?.toString();
      if (userId) {
        const remainingSockets = removeSocketFromUser(userId, socket.id);
        if (remainingSockets === 0) {
          io.emit("userOffline", { userId });
        }
      }
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}
