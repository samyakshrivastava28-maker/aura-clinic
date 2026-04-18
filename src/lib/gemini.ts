import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API key from environment
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
