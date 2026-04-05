import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";

import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL_NAME, HF_API_URL, HUGGINGFACE_API_KEY } from "../constant/index.js";

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



// hugging face models
export const queryHFModel = async (model, input) => {
  try {
    const response = await axios.post(
      `${HF_API_URL}${model}`,
      { inputs: input },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
   
    console.error("Hugging Face API error:", error.response?.data || error.message);
    return null;
  }
};
