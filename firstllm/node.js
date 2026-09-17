import { GoogleGenAI } from "@google/genai";

process.loadEnvFile(".env");

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const response = await genai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: "I'm really frustrated because I can't find or track my Zomato order. Please help me locate my order and tell me its current status. If you need my order ID, registered phone number, or any other details, let me know exactly what information you need. Please don't give me generic troubleshooting steps—help me resolve the issue."
,
});

console.log(response.text);