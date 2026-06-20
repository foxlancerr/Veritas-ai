import OpenAI from "openai";
import { GROQ_API_KEY, GROQ_MODEL_NAME } from "../constant/index.js";

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const generateAIContent = async (
  userMessage,
  token,
  isJson = false,
  systemPrompt = null,
) => {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: userMessage });

  const msg = await client.chat.completions.create({
    model: GROQ_MODEL_NAME,
    max_tokens: token,
    messages,
    ...(isJson && { response_format: { type: "json_object" } }),
  });

  return msg.choices[0].message.content;
};

export const fakeDetectionPost = async (content) => {
  const systemPrompt = `
You are a moderation system for a professional social platform.

Analyze the post and return JSON only.

Rules:
- No spam
- No scams
- No hate speech
- No harassment
- No adult content
- No misinformation
- No illegal activity

Return:

{
  "approved": true,
  "spam": false,
  "toxicity": false,
  "misinformationRisk": "low",
  "confidence": 95,
  "reason": ""
}
`;

  const response = await generateAIContent(content, 300, true, systemPrompt);

  return JSON.parse(response);
};
