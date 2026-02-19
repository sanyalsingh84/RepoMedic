import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  googleApiKey: process.env.GOOGLE_GENAI_API_KEY,
  aiMode: (process.env.AI_MODE || "local") as "local" | "cloud",
  ollamaModel: process.env.OLLAMA_MODEL || "deepseek-coder:6.7b",
  ragExtensions: (process.env.RAG_EXTENSIONS ?? ".ts,.js,.tsx,.jsx,.py,.go,.rs,.java,.c,.cpp")
    .split(",")
    .map((ext) => ext.trim()),
  ragExclude: (process.env.RAG_EXCLUDE ?? "node_modules,dist,build,out,.git")
    .split(",")
    .map((dir) => dir.trim()),
};
