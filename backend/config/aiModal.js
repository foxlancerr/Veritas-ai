import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL_NAME } from "../constant/index.js";

export const ANTHROPIC = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export const generateAIContent = async (postDescription, token) => {
  // 1. Generate the Comment using Anthropic
  const msg = await ANTHROPIC.messages.create({
    model: ANTHROPIC_MODEL_NAME,
    max_tokens: token,
    messages: [
      {
        role: "user",
        content: postDescription,
      },
    ],
  });

  return msg.content[0].text;
};
