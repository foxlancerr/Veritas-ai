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

  const options = {
    model: GROQ_MODEL_NAME,
    max_tokens: token,
    messages,
    ...(isJson && { response_format: { type: "json_object" } }),
  };

  const msg = await client.chat.completions.create(options);
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

export const summarizeConversation = async (messages) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  const conversationText = messages
    .map(
      (msg) =>
        `${msg.sender?.firstName || "User"}: ${msg.text}`
    )
    .join("\n")
    .substring(0, 4000);

  const systemPrompt = `You are an AI assistant that summarizes conversations. Analyze the conversation and provide a structured summary in JSON format.

Return ONLY valid JSON with no markdown formatting, no code blocks, and no extra text.

Return this exact structure:
{
  "summary": "2-3 sentence overall summary of the conversation",
  "topics": ["topic1", "topic2", "topic3"],
  "decisions": ["decision1", "decision2"],
  "actionItems": ["action1", "action2"],
  "pendingQuestions": ["question1", "question2"]
}

If any section is empty, return an empty array or empty string.`;

  const userPrompt = `Summarize this conversation:\n\n${conversationText}`;

  try {
    const response = await generateAIContent(
      userPrompt,
      600,
      true,
      systemPrompt
    );

    return JSON.parse(response);
  } catch (error) {
    console.error("Error parsing AI summary response:", error);
    return null;
  }
};

export const generateReplySuggestions = async (messages) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  const recentMessages = messages.slice(-15).map(
    (msg) => `${msg.sender?.firstName || "User"}: ${msg.text}`
  );
  
  const conversationContext = recentMessages.join("\n");

  const systemPrompt = `You are a helpful assistant that suggests natural, contextual replies for conversations.
Analyze the conversation and suggest 3-5 natural, short reply options that continue the conversation naturally.

Rules:
- Suggestions must be SHORT (under 15 words each)
- Suggestions must be NATURAL and conversational
- Suggestions must MATCH the tone and language of the conversation
- Never suggest formal or robotic replies
- Avoid generic responses like "Thanks" or "Ok"
- Auto-detect language from conversation and match it

Return ONLY valid JSON with no markdown formatting, no code blocks, and no extra text.

Return this exact structure:
{
  "suggestions": ["reply1", "reply2", "reply3"]
}

Generate exactly 3-5 suggestions. Never more, never less.`;

  const userPrompt = `Based on this conversation, suggest 3-5 natural reply options:\n\n${conversationContext}\n\nRespond with ONLY the JSON, no other text.`;

  try {
    const response = await generateAIContent(
      userPrompt,
      250,
      true,
      systemPrompt
    );

    const parsed = JSON.parse(response);
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions.filter((s) => s && typeof s === "string" && s.trim());
    }
    return null;
  } catch (error) {
    console.error("Error generating reply suggestions:", error);
    return null;
  }
};
