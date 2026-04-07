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
import notificationRouter from "./routes/notification.routes.js";
import { allowCors } from "./middlewares/allowCors.js";
import { setupSocket } from "./config/socket.js";
import chatbotRouter from "./routes/chatbot.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const PORT = process.env.PORT || 8020;
const server = http.createServer(app);
export const io = setupSocket(server); // initialize socket with the server

allowCors(app);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/post", postRoutes);
server.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
