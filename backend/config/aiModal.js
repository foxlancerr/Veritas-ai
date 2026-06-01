import OpenAI from "openai";
import { GROQ_API_KEY, GROQ_MODEL_NAME } from "../constant/index.js";

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateAIContent = async (userMessage, token, systemPrompt = null) => {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const msg = await client.chat.completions.create({
    model: GROQ_MODEL_NAME,
    max_tokens: token,
    messages,
  });

  return msg.choices[0].message.content;
};
