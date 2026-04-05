import dotenv from "dotenv";
dotenv.config();

const ANTHROPIC_MODEL_NAME = process.env.ANTHROPIC_MODEL_NAME;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export { ANTHROPIC_MODEL_NAME, ANTHROPIC_API_KEY };
