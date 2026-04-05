import dotenv from "dotenv";
dotenv.config();

const ANTHROPIC_MODEL_NAME = process.env.ANTHROPIC_MODEL_NAME;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/";

export {
  ANTHROPIC_MODEL_NAME,
  ANTHROPIC_API_KEY,
  HUGGINGFACE_API_KEY,
  HF_API_URL,
};
