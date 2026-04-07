// backend/routes/chatbot.routes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { httpChatHandler } from "../controllers/chatbot.controllers.js";

const chatbotRouter = express.Router();

// POST /api/chatbot/query - REST fallback (optional)
chatbotRouter.post("/query", isAuth, httpChatHandler);

export default chatbotRouter;