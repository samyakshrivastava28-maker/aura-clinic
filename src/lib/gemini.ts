import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API key from environment
// Supports both server-side (process.env) and client-side (import.meta.env)
const getApiKey = (): string => {
  if (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // @ts-ignore - Vite environment variable access
  const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (viteKey) return viteKey;
  
  return "";
};

const apiKey = getApiKey();

if (!apiKey) {
  console.warn("GEMINI_API_KEY or VITE_GEMINI_API_KEY is not set. AI features may not work.");
}

export const ai = new GoogleGenAI({ apiKey });
