import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API key from environment
// Vite is configured to inject process.env.GEMINI_API_KEY at build time
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
