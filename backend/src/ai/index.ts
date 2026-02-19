import { GeminiAssistant } from "./gemini/gemini.assistant.js";
import { OllamaAssistant } from "./ollama/ollama.assistant.js";
import type { AIAssistant } from "./assistant.interface.js";
import { env } from "../config/env.js";

const getAssistant = (): AIAssistant => {
  if (env.aiMode === "cloud") {
    console.log("🤖 Using Cloud AI (Gemini)");
    return new GeminiAssistant();
  }
  
  console.log(`🏠 Using Local AI (Ollama - ${env.ollamaModel})`);
  return new OllamaAssistant();
};

export const aiAssistant = getAssistant();
export * from "./assistant.interface.js";
