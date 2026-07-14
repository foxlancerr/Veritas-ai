import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesSeen,
  summarizeConv,
  getReplySuggestions,
} from "../controllers/chat.controllers.js";

const router = express.Router();

router.post("/conversation", isAuth, createOrGetConversation);
router.get("/conversations", isAuth, getConversations);
router.get("/messages/:conversationId", isAuth, getMessages);
router.post("/message", isAuth, sendMessage);
router.post("/message/seen", isAuth, markMessagesSeen);
router.post("/conversations/:conversationId/summarize", isAuth, summarizeConv);
router.get("/conversations/:conversationId/reply-suggestions", isAuth, getReplySuggestions);

export default router;
