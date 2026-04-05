import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";


import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import http from "http";
import { Server } from "socket.io";
import notificationRouter from "./routes/notification.routes.js";
import { allowCors } from "./middlewares/allowCors.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT || 8020;
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend port (Vite default)
    credentials: true, // allow cookies to be sent
  },
});

allowCors(app);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/post", postRoutes);

export const userSocketMap = new Map();
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(userSocketMap);
  });
  socket.on("disconnect", (socket) => {});
});

server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
