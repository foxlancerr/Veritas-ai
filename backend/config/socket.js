// backend/socket.js (or wherever you handle socket connections)
import { Server } from "socket.io";
import { verifyToken } from "./genToken.js";
import { processChatMessage } from "../controllers/chatbot.controllers.js";
// import { processChatMessage } from "../controllers/chatbot.controllers";


export const userSocketMap = new Map();
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

    socket.on("register", (userId) => {
      userSocketMap.set(userId, socket.id);
    });
    socket.on("disconnect", (socket) => {});

    socket.on("chat-message", async (data) => {
      const { message, intent } = data;
      try {
        // Call the controller
        const reply = await processChatMessage(socket.userId, message, intent);
        socket.emit("bot-reply", { content: reply });
      } catch (error) {
        socket.emit("bot-reply", {
          content: "Sorry, I'm having trouble right now. Please try again.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}
